import { test, expect } from "@playwright/test";

// Basic smoke test to ensure key flows render and buttons are usable.
test("home CTA navigates to builder and shows primary actions", async ({ page }) => {
  page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
  await page.goto("/");

  const html = await page.content();
  console.log("[content snippet]", html.slice(0, 400));
  console.log("[body text]", (await page.locator("body").innerText()).slice(0, 200));
  console.log("[root html snippet]", (await page.locator("#root").innerHTML()).slice(0, 200));
  console.log(
    "[dom info]",
    await page.evaluate(() => ({
      rootExists: !!document.getElementById("root"),
      rootChildren: document.getElementById("root")?.childElementCount ?? 0,
      scripts: Array.from(document.scripts).map((s) => s.src || s.textContent?.slice(0, 50)),
    })),
  );

  await expect(page.getByRole("heading", { name: /build landing pages/i })).toBeVisible();

  const openBuilder = page.getByRole("button", { name: /open builder/i }).or(page.getByText("Open Builder"));
  await expect(openBuilder).toBeVisible();

  await openBuilder.first().click();
  await expect(page).toHaveURL(/\/builder$/);

  await expect(page.getByRole("heading", { name: /your pages/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /blank page/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /from template/i })).toBeVisible();
});
