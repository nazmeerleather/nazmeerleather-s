export type NavChild = { title: string; href: string };
export type NavSection = {
  title: string;
  href: string;
  children: NavChild[];
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function section(title: string, children: string[]): NavSection {
  const base = slug(title);
  return {
    title,
    href: `/shop/${base}`,
    children: children.map((c) => ({
      title: c,
      href: `/shop/${base}/${slug(c)}`,
    })),
  };
}

export const NAV: NavSection[] = [
  section("Men", [
    "Leather Jackets",
    "Short Leather Wallets",
    "Long Leather Wallets",
    "Laptop Bags",
  ]),
  section("Women", [
    "Leather Jackets",
    "Leather Coats",
    "Tote Bags",
    "Cross Body Bags",
    "Shoulder Bags",
  ]),
  section("Gloves", ["Motorcycle Gloves"]),
  section("Big Packs", ["Duffle Bags"]),
  {
    title: "Customize",
    href: "/customize",
    children: [
      { title: "Men's Jackets", href: "/customize/mens-jackets" },
      { title: "Women's Jackets", href: "/customize/womens-jackets" },
      { title: "Women's Coats", href: "/customize/womens-coats" },
    ],
  },
];