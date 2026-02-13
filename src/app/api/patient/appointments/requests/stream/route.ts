import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Server-Sent Events: pasiyentin request-lərində dəyişiklik olanda “ping”
 * GET /api/patient/appointments/requests/stream?patientEmail=...
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientEmail = searchParams.get("patientEmail") || "";

  if (!patientEmail) {
    return new Response("patientEmail required", { status: 400 });
  }

  // patientId tap
  const pat = await prisma.patient.findFirst({
    where: { email: patientEmail },
    select: { id: true },
  });
  if (!pat?.id) {
    return new Response("no patient", { status: 200, headers: { "Content-Type": "text/event-stream" } });
  }

  const encoder = new TextEncoder();
  let last = 0;

  const stream = new ReadableStream({
    start(controller) {
      let stopped = false;
      let timer: NodeJS.Timeout | null = null;

      const push = async () => {
        try {
          const row = await prisma.appointmentRequest.findFirst({
            where: { patientId: pat.id },
            orderBy: { updatedAt: "desc" },
            select: { updatedAt: true },
          });
          const ts = row?.updatedAt ? row.updatedAt.getTime() : 0;
          if (ts > last) {
            last = ts;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ updatedAt: ts })}\n\n`));
          }
        } catch {
          // ignore
        }
      };

      // ilk göndəriş + 3s interval
      push();
      timer = setInterval(push, 3000);

      const close = () => {
        if (stopped) return;
        stopped = true;
        if (timer) clearInterval(timer);
        try { controller.close(); } catch {}
      };

      // @ts-ignore
      req.signal?.addEventListener?.("abort", close);
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
