export default async function getUser() {
    const response = await fetch("http://localhost:5000/me", { credentials: "include" });
    const body = await response.json()
    return { body, ok: response.ok }
}