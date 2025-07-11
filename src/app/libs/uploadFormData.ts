export async function uploadFormData(endpoint: string, data: FormData) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return await res.json();
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
}
