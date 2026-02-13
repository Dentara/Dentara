import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get("clinicId");
  const doctorId = searchParams.get("doctorId");

  if (!clinicId && !doctorId) {
    return new Response(JSON.stringify({ error: "clinicId or doctorId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let stopped = false;
      let t1: NodeJS.Timeout | null = null;
      let t2: NodeJS.Timeout | null = null;

      async function pushCount() {
        try {
          const where: any = { status: "pending" };
          if (clinicId) where.clinicId = clinicId;
          if (doctorId) where.doctorId = doctorId;
          const count = await prisma.appointmentRequest.count({ where });
          const payload = `data: ${JSON.stringify({ count })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          const payload = `event: error\ndata: "db_error"\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
      }

      // İlk göndəriş
      pushCount();

      // Hər 5 saniyədən bir yenilə
      t1 = setInterval(pushCount, 5000);

      // Keep-alive
      t2 = setInterval(() => {
        controller.enqueue(encoder.encode(`: keepalive\n\n`));
      }, 15000);

      const close = () => {
        if (stopped) return;
        stopped = true;
        if (t1) clearInterval(t1);
        if (t2) clearInterval(t2);
        try {
          controller.close();
        } catch {}
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
