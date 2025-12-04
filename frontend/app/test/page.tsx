export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`);
  const data = await res.json();

  return (
    <main style={{ padding: 20 }}>
      <h1>Backend Connection Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
