export default async function handler(req, res) {
  try {
    const url = process.env.JSON1_URL;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load JSON1" });
  }
}
