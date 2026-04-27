import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  X,
  ImagePlus,
  Power,
  CheckSquare,
  Square,
} from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader } from "@/components/ui-ez/Primitives";
import {
  CATEGORIES,
  ITEMS,
  pickName,
  formatMoney,
  type MenuItem,
  type AddOn,
  type MenuCategory,
} from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "القائمة — EZ Vendor" },
      { name: "description", content: "إدارة فئات وأصناف وإضافات قائمة المطعم" },
    ],
  }),
  component: MenuPage,
});

type EditState = { open: boolean; item: MenuItem | null };

function MenuPage() {
  const { t, locale } = useApp();

  const [categories, setCategories] = useState<MenuCategory[]>(CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(ITEMS);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [edit, setEdit] = useState<EditState>({ open: false, item: null });

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const inCat = activeCat === "all" ? true : i.category === activeCat;
      const q = query.trim().toLowerCase();
      const inQuery =
        !q ||
        i.name.ar.toLowerCase().includes(q) ||
        i.name.en.toLowerCase().includes(q) ||
        i.name.ku.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [items, activeCat, query]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelectedOnPage =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) filtered.forEach((i) => next.delete(i.id));
      else filtered.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const bulkSetAvailability = (val: boolean) => {
    setItems((prev) =>
      prev.map((i) => (selected.has(i.id) ? { ...i, available: val } : i))
    );
    setSelected(new Set());
  };
  const bulkDelete = () => {
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
  };

  const toggleItemAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i))
    );
  };

  const deleteItem = (id: string) => {
    if (confirm(t("menu.confirmDelete"))) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const saveItem = (next: MenuItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === next.id);
      return exists ? prev.map((p) => (p.id === next.id ? next : p)) : [next, ...prev];
    });
    setEdit({ open: false, item: null });
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div>
      <PageHeader
        title={t("menu.title")}
        subtitle={t("menu.subtitle")}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">
              <Plus className="h-4 w-4" /> {t("menu.addCategory")}
            </button>
            <button
              onClick={() =>
                setEdit({
                  open: true,
                  item: {
                    id: `i_${Date.now()}`,
                    category: activeCat === "all" ? categories[0]?.id ?? "c1" : activeCat,
                    name: { ar: "", en: "", ku: "" },
                    desc: { ar: "", en: "", ku: "" },
                    price: 0,
                    available: true,
                    sold: 0,
                    image: "🍽️",
                    addons: [],
                  },
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> {t("menu.addItem")}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Categories panel */}
        <aside className="ez-card ez-shadow p-3 h-fit">
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("menu.categories")}
            </span>
            <button className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-accent" title={t("menu.addCategory")}>
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveCat("all")}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition",
                  activeCat === "all"
                    ? "bg-primary text-primary-foreground font-semibold ez-shadow"
                    : "hover:bg-accent"
                )}
              >
                <span>{t("menu.allItems")}</span>
                <span
                  className={cn(
                    "ez-num text-xs",
                    activeCat === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {items.length}
                </span>
              </button>
            </li>

            {categories.map((c) => {
              const count = items.filter((i) => i.category === c.id).length;
              const active = activeCat === c.id;
              return (
                <li key={c.id} className="group">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-md transition",
                      active ? "bg-primary text-primary-foreground ez-shadow" : "hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-6 cursor-grab place-items-center text-xs",
                        active ? "text-primary-foreground/70" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                      )}
                      title={t("menu.dragHint")}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </span>
                    <button
                      onClick={() => setActiveCat(c.id)}
                      className="flex flex-1 items-center justify-between py-2 pe-2 text-sm"
                    >
                      <span className={cn("font-medium", active && "font-semibold")}>
                        {pickName(c.name, locale)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            c.active ? "bg-success" : "bg-muted-foreground/50"
                          )}
                        />
                        <span
                          className={cn(
                            "ez-num text-xs",
                            active ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {count}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => toggleCategoryActive(c.id)}
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded opacity-0 transition group-hover:opacity-100",
                        active ? "text-primary-foreground hover:bg-white/10" : "text-muted-foreground hover:bg-background"
                      )}
                      title={c.active ? t("menu.unavailable") : t("menu.available")}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Items panel */}
        <section className="ez-card ez-shadow flex flex-col">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("menu.searchItems")}
                className="h-10 w-full rounded-lg border border-input bg-secondary/60 ps-10 pe-3 text-sm outline-none transition focus:border-ring focus:bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                {allSelectedOnPage ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                {filtered.length} {t("menu.itemsCount")}
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-primary-soft px-4 py-2.5">
              <span className="text-sm font-semibold text-primary">
                <span className="ez-num">{selected.size}</span> {t("menu.bulkSelected")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => bulkSetAvailability(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success hover:bg-success/15"
                >
                  <Power className="h-3.5 w-3.5" /> {t("menu.bulkEnable")}
                </button>
                <button
                  onClick={() => bulkSetAvailability(false)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  <Power className="h-3.5 w-3.5" /> {t("menu.bulkDisable")}
                </button>
                <button
                  onClick={bulkDelete}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t("menu.bulkDelete")}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="p-3">
            {filtered.length === 0 ? (
              <div className="p-4">
                <EmptyMenu
                  title={t("states.emptyMenuTitle")}
                  description={t("states.emptyMenuDesc")}
                  actionLabel={t("menu.addItem")}
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => {
                  const cat = categories.find((c) => c.id === item.category);
                  const isSelected = selected.has(item.id);
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-2 py-3 transition",
                        isSelected ? "bg-primary-soft/60" : "hover:bg-accent/50"
                      )}
                    >
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="grid h-5 w-5 place-items-center text-muted-foreground"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>

                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-secondary text-2xl ez-shadow">
                        {item.image ?? "🍽️"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-semibold">{pickName(item.name, locale)}</h4>
                          {cat && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {pickName(cat.name, locale)}
                            </span>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <span className="rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">
                              +{item.addons.length} {t("menu.addons")}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {pickName(item.desc, locale)}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="ez-num">
                            <span className="font-semibold text-foreground">{item.sold}</span> {t("menu.sold")}
                          </span>
                        </div>
                      </div>

                      <div className="hidden text-end sm:block">
                        <div className="ez-num text-base font-bold text-primary">
                          {formatMoney(item.price)}
                          <span className="ms-1 text-[10px] font-medium text-muted-foreground">
                            {t("common.currency")}
                          </span>
                        </div>
                      </div>

                      {/* Availability toggle */}
                      <Toggle
                        checked={item.available}
                        onChange={() => toggleItemAvailability(item.id)}
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEdit({ open: true, item })}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
                          title={t("common.edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-card">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {edit.open && edit.item && (
        <ItemEditor
          item={edit.item}
          categories={categories}
          onClose={() => setEdit({ open: false, item: null })}
          onSave={saveItem}
        />
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
        checked ? "bg-success" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
          checked ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-0.5 rtl:-translate-x-0.5"
        )}
      />
    </button>
  );
}

function ItemEditor({
  item,
  categories,
  onClose,
  onSave,
}: {
  item: MenuItem;
  categories: MenuCategory[];
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}) {
  const { t, locale } = useApp();
  const [draft, setDraft] = useState<MenuItem>(item);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !ITEMS.some((i) => i.id === item.id);

  const update = <K extends keyof MenuItem>(key: K, val: MenuItem[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const updateName = (lang: "ar" | "en" | "ku", val: string) =>
    setDraft((d) => ({ ...d, name: { ...d.name, [lang]: val } }));
  const updateDesc = (lang: "ar" | "en" | "ku", val: string) =>
    setDraft((d) => ({ ...d, desc: { ...d.desc, [lang]: val } }));

  const addAddon = () => {
    const next: AddOn = {
      id: `a_${Date.now()}`,
      name: { ar: "", en: "", ku: "" },
      price: 0,
    };
    setDraft((d) => ({ ...d, addons: [...(d.addons ?? []), next] }));
  };
  const updateAddon = (id: string, patch: Partial<AddOn>) =>
    setDraft((d) => ({
      ...d,
      addons: (d.addons ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  const removeAddon = (id: string) =>
    setDraft((d) => ({ ...d, addons: (d.addons ?? []).filter((a) => a.id !== id) }));

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    update("image", url);
  };

  const isImageUrl = draft.image?.startsWith("blob:") || draft.image?.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="ez-card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-border ez-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">
              {isNew ? t("menu.newItem") : t("menu.editItem")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {pickName(
                categories.find((c) => c.id === draft.category)?.name ?? { ar: "", en: "", ku: "" },
                locale
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Image */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              {t("menu.itemImage")}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className="group relative flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-border bg-secondary/40 p-4 transition hover:border-primary/40 hover:bg-primary-soft/30"
            >
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-soft to-secondary text-3xl">
                {isImageUrl ? (
                  <img src={draft.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{draft.image || "🍽️"}</span>
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold">{t("menu.uploadImage")}</p>
                <p className="text-xs text-muted-foreground">{t("menu.dropImage")}</p>
              </div>
              <ImagePlus className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>

          {/* Names */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              {t("menu.itemName")}
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["ar", "en", "ku"] as const).map((lng) => (
                <div key={lng}>
                  <input
                    dir={lng === "en" ? "ltr" : "rtl"}
                    value={draft.name[lng]}
                    onChange={(e) => updateName(lng, e.target.value)}
                    placeholder={t(`menu.itemName${lng === "ar" ? "Ar" : lng === "en" ? "En" : "Ku"}`)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                  />
                  <span className="mt-1 block text-[10px] uppercase text-muted-foreground">{lng}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              {t("menu.itemDesc")}
            </label>
            <textarea
              value={draft.desc[locale]}
              onChange={(e) => updateDesc(locale, e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Price + Category + Availability */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                {t("menu.price")}
              </label>
              <div className="flex h-10 items-center rounded-lg border border-input bg-background">
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className="ez-num h-full w-full bg-transparent px-3 text-sm font-semibold outline-none"
                />
                <span className="px-3 text-xs text-muted-foreground">{t("common.currency")}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                {t("menu.itemCategory")}
              </label>
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {pickName(c.name, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                {t("common.status")}
              </label>
              <button
                onClick={() => update("available", !draft.available)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition",
                  draft.available
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-input bg-card text-muted-foreground"
                )}
              >
                <span>{draft.available ? t("menu.available") : t("menu.unavailable")}</span>
                <Toggle checked={draft.available} onChange={() => update("available", !draft.available)} />
              </button>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("menu.addonsTitle")}
              </label>
              <button
                onClick={addAddon}
                className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-1 text-xs font-semibold hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5" /> {t("menu.addAddon")}
              </button>
            </div>

            {(draft.addons ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-6 text-center text-xs text-muted-foreground">
                {t("menu.addAddon")}
              </div>
            ) : (
              <div className="space-y-2">
                {(draft.addons ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    <input
                      value={a.name[locale]}
                      onChange={(e) =>
                        updateAddon(a.id, { name: { ...a.name, [locale]: e.target.value } })
                      }
                      placeholder={t("menu.addonName")}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
                    />
                    <div className="flex h-9 w-32 items-center rounded-md border border-input bg-background">
                      <input
                        type="number"
                        value={a.price}
                        onChange={(e) => updateAddon(a.id, { price: Number(e.target.value) })}
                        placeholder={t("menu.addonPrice")}
                        className="ez-num h-full w-full bg-transparent px-2 text-sm font-semibold outline-none"
                      />
                      <span className="px-2 text-[10px] text-muted-foreground">
                        {t("common.currency")}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAddon(a.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/40 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={() => onSave(draft)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
