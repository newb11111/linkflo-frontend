"use client"

import { useMemo, useState } from "react"
import { API_URL, getSiteOrigin } from "../../lib/config"
import { getAdminHeaders } from "../../lib/adminAuth"

const apiBase = API_URL

const defaultSections = {
  hero: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    ctaText: "",
    whatsappMessage: "",
  },
  problem: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ title: "", desc: "", image: "" }],
  },
  conversion: {
    title: "",
    subtitle: "",
    backgroundImage: "",
  },
  solution: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ title: "", desc: "", image: "" }],
  },
  process: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ title: "", desc: "", image: "" }],
  },
  showcase: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ title: "", desc: "", image: "", youtubeUrl: "" }],
  },
  reviews: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ name: "", text: "", image: "" }],
  },
  offer: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ name: "", desc: "", price: "", image: "" }],
  },
  faq: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    items: [{ q: "", a: "" }],
  },
  cta: {
    title: "",
    subtitle: "",
    backgroundImage: "",
    buttonText: "",
    whatsappMessage: "",
  },
}

function mergeSections(initialData = {}) {
  const sections = initialData.sections || {}

  return Object.fromEntries(
    Object.entries(defaultSections).map(([key, value]) => {
      const oldSection = sections[key] || {}

      const fixedSection = {
        ...value,
        ...oldSection,
        items: oldSection?.items?.length ? oldSection.items : value.items,
      }

      if (key === "conversion") {
        fixedSection.backgroundImage =
          oldSection.backgroundImage || oldSection.image || ""
        delete fixedSection.image
      }

      return [key, fixedSection]
    })
  )
}

export default function PageForm({
  mode = "create",
  pageId,
  initialForm,
  initialData,
  slug,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: initialForm?.name || initialData?.brandName || "",
    whatsapp: initialForm?.whatsapp || initialData?.whatsapp || "",
    packageType:
      initialForm?.packageType ||
      initialForm?.plan ||
      initialData?.packageType ||
      "proplus",
  })

  const [sections, setSections] = useState(() => mergeSections(initialData))
  const [result, setResult] = useState(slug ? `${getSiteOrigin()}/${slug}` : "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Landing Page" : "Create Landing Page"),
    [mode]
  )

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateSection = (section, field, value) => {
    setSections((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateItem = (section, index, field, value) => {
    setSections((prev) => {
      const items = [...(prev[section]?.items || [])]
      items[index] = { ...items[index], [field]: value }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          items,
        },
      }
    })
  }

  const addItem = (section, item) => {
    setSections((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...(prev[section]?.items || []), item],
      },
    }))
  }

  const removeItem = (section, index) => {
    setSections((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.filter((_, i) => i !== index),
      },
    }))
  }

  const handleUpload = async (file, apply) => {
    if (!file) return

    const body = new FormData()
    body.append("image", file)

    try {
      setMessage("Uploading image...")

      const res = await fetch(`${apiBase}/api/admin/upload`, {
        method: "POST",
        headers: getAdminHeaders(),
        body,
      })

      const json = await res.json()
      if (!res.ok || !json.url) {
        throw new Error(json.message || json.error || "Upload failed")
      }

      apply(json.url)
      setMessage("Image uploaded")
    } catch (err) {
      setMessage(err.message || "Upload failed")
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setMessage("")

      const endpoint =
        mode === "edit"
          ? `${apiBase}/api/admin/page/${pageId}`
          : `${apiBase}/api/admin/create`

      const payload = {
        name: form.name,
        whatsapp: form.whatsapp,
        packageType: form.packageType,
        data: {
          brandName: form.name,
          whatsapp: form.whatsapp,
          packageType: form.packageType,
          sections,
        },
      }

      const res = await fetch(endpoint, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Save failed")

      const finalSlug = json.slug || json.page?.slug || slug
      if (finalSlug) setResult(`${getSiteOrigin()}/${finalSlug}`)

      setMessage(mode === "edit" ? "Saved successfully" : "Page created successfully")
      onSuccess?.(json)
    } catch (err) {
      setMessage(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerCard}>
        <div>
          <p style={styles.eyebrow}>LinkFlo Admin V2</p>
          <h1 style={styles.title}>{pageTitle}</h1>
          <p style={styles.subtitle}>
            这版会生成 data.sections，专门配合 V2 Landing Page。
          </p>
        </div>

        {slug ? (
          <div style={styles.slugBox}>
            <span style={styles.slugLabel}>Slug</span>
            <span style={styles.slugValue}>/{slug}</span>
          </div>
        ) : null}
      </div>

      <SectionCard title="Basic Info">
        <Field label="品牌名 / Brand Name">
          <input
            value={form.name}
            onChange={(e) => setFormField("name", e.target.value)}
            style={styles.input}
          />
        </Field>

        <Field label="WhatsApp">
          <input
            value={form.whatsapp}
            onChange={(e) => setFormField("whatsapp", e.target.value)}
            style={styles.input}
          />
        </Field>

        <Field label="Package Type">
          <select
            value={form.packageType}
            onChange={(e) => setFormField("packageType", e.target.value)}
            style={styles.input}
          >
            <option value="starter">starter</option>
            <option value="pro">pro</option>
            <option value="proplus">proplus</option>
          </select>
        </Field>
      </SectionCard>

      <div style={styles.grid}>
        <HeroSection
          section={sections.hero}
          updateSection={updateSection}
          handleUpload={handleUpload}
        />

        <ListSection
          title="Problem"
          sectionKey="problem"
          section={sections.problem}
          itemTemplate={{ title: "", desc: "", image: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["title", "desc", "image"]}
        />

        <ConversionSection
          section={sections.conversion}
          updateSection={updateSection}
          handleUpload={handleUpload}
        />

        <ListSection
          title="Solution"
          sectionKey="solution"
          section={sections.solution}
          itemTemplate={{ title: "", desc: "", image: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["title", "desc", "image"]}
        />

        <ListSection
          title="Process"
          sectionKey="process"
          section={sections.process}
          itemTemplate={{ title: "", desc: "", image: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["title", "desc", "image"]}
        />

        <ListSection
          title="Showcase"
          sectionKey="showcase"
          section={sections.showcase}
          itemTemplate={{ title: "", desc: "", image: "", youtubeUrl: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["title", "desc", "image", "youtubeUrl"]}
        />

        <ListSection
          title="Reviews"
          sectionKey="reviews"
          section={sections.reviews}
          itemTemplate={{ name: "", text: "", image: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["name", "text", "image"]}
        />

        <ListSection
          title="Offer"
          sectionKey="offer"
          section={sections.offer}
          itemTemplate={{ name: "", desc: "", price: "", image: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["name", "desc", "price", "image"]}
        />

        <ListSection
          title="FAQ"
          sectionKey="faq"
          section={sections.faq}
          itemTemplate={{ q: "", a: "" }}
          updateSection={updateSection}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          handleUpload={handleUpload}
          fields={["q", "a"]}
        />

        <CtaSection
          section={sections.cta}
          updateSection={updateSection}
          handleUpload={handleUpload}
        />
      </div>

      <div style={styles.footerBar}>
        <div>
          {message ? <p style={styles.message}>{message}</p> : null}
          {result ? (
            <a href={result} target="_blank" rel="noreferrer" style={styles.previewLink}>
              Preview: {result}
            </a>
          ) : null}
        </div>

        <button type="button" onClick={handleSubmit} disabled={saving} style={styles.saveButton}>
          {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Generate Page"}
        </button>
      </div>
    </div>
  )
}

function HeroSection({ section, updateSection, handleUpload }) {
  return (
    <SectionCard title="Hero">
      <Field label="Title">
        <input
          value={section.title}
          onChange={(e) => updateSection("hero", "title", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="Subtitle">
        <textarea
          value={section.subtitle}
          onChange={(e) => updateSection("hero", "subtitle", e.target.value)}
          style={styles.textarea}
        />
      </Field>

      <ImageField
        label="Background Image"
        value={section.backgroundImage}
        onChange={(value) => updateSection("hero", "backgroundImage", value)}
        onUpload={(file) =>
          handleUpload(file, (url) => updateSection("hero", "backgroundImage", url))
        }
      />

      <Field label="CTA Button Text">
        <input
          value={section.ctaText}
          onChange={(e) => updateSection("hero", "ctaText", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="WhatsApp Message">
        <textarea
          value={section.whatsappMessage}
          onChange={(e) => updateSection("hero", "whatsappMessage", e.target.value)}
          style={styles.textarea}
        />
      </Field>
    </SectionCard>
  )
}

function ConversionSection({ section, updateSection, handleUpload }) {
  return (
    <SectionCard title="Conversion Gap">
      <Field label="Title">
        <input
          value={section.title}
          onChange={(e) => updateSection("conversion", "title", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="Subtitle">
        <textarea
          value={section.subtitle}
          onChange={(e) => updateSection("conversion", "subtitle", e.target.value)}
          style={styles.textarea}
        />
      </Field>

      <ImageField
        label="Background Image"
        value={section.backgroundImage}
        onChange={(value) => updateSection("conversion", "backgroundImage", value)}
        onUpload={(file) =>
          handleUpload(file, (url) => updateSection("conversion", "backgroundImage", url))
        }
      />
    </SectionCard>
  )
}

function CtaSection({ section, updateSection, handleUpload }) {
  return (
    <SectionCard title="Final CTA">
      <Field label="Title">
        <input
          value={section.title}
          onChange={(e) => updateSection("cta", "title", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="Subtitle">
        <textarea
          value={section.subtitle}
          onChange={(e) => updateSection("cta", "subtitle", e.target.value)}
          style={styles.textarea}
        />
      </Field>

      <ImageField
        label="Background Image"
        value={section.backgroundImage}
        onChange={(value) => updateSection("cta", "backgroundImage", value)}
        onUpload={(file) =>
          handleUpload(file, (url) => updateSection("cta", "backgroundImage", url))
        }
      />

      <Field label="Button Text">
        <input
          value={section.buttonText}
          onChange={(e) => updateSection("cta", "buttonText", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="WhatsApp Message">
        <textarea
          value={section.whatsappMessage}
          onChange={(e) => updateSection("cta", "whatsappMessage", e.target.value)}
          style={styles.textarea}
        />
      </Field>
    </SectionCard>
  )
}

function ListSection({
  title,
  sectionKey,
  section,
  itemTemplate,
  updateSection,
  updateItem,
  addItem,
  removeItem,
  handleUpload,
  fields,
}) {
  return (
    <SectionCard title={title}>
      <Field label="Section Title">
        <input
          value={section.title}
          onChange={(e) => updateSection(sectionKey, "title", e.target.value)}
          style={styles.input}
        />
      </Field>

      <Field label="Section Subtitle">
        <textarea
          value={section.subtitle}
          onChange={(e) => updateSection(sectionKey, "subtitle", e.target.value)}
          style={styles.textarea}
        />
      </Field>

      <ImageField
        label="Section Background Image"
        value={section.backgroundImage || ""}
        onChange={(value) => updateSection(sectionKey, "backgroundImage", value)}
        onUpload={(file) =>
          handleUpload(file, (url) => updateSection(sectionKey, "backgroundImage", url))
        }
      />

      {(section.items || []).map((item, index) => (
        <div key={index} style={styles.subCard}>
          <div style={styles.subCardHeader}>
            <p style={styles.subCardTitle}>Item {index + 1}</p>
            <button
              type="button"
              onClick={() => removeItem(sectionKey, index)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>

          {fields.map((field) => {
            if (field === "image") {
              return (
                <ImageField
                  key={field}
                  label="Image"
                  value={item.image || ""}
                  onChange={(value) => updateItem(sectionKey, index, "image", value)}
                  onUpload={(file) =>
                    handleUpload(file, (url) => updateItem(sectionKey, index, "image", url))
                  }
                  compact
                />
              )
            }

            const isLong = ["desc", "text", "a"].includes(field)

            return (
              <Field key={field} label={field === "youtubeUrl" ? "Youtube Url" : field}>
                {isLong ? (
                  <textarea
                    value={item[field] || ""}
                    onChange={(e) => updateItem(sectionKey, index, field, e.target.value)}
                    style={styles.textarea}
                  />
                ) : (
                  <input
                    value={item[field] || ""}
                    onChange={(e) => updateItem(sectionKey, index, field, e.target.value)}
                    style={styles.input}
                    placeholder={field === "youtubeUrl" ? "Paste YouTube link here" : ""}
                  />
                )}
              </Field>
            )
          })}
        </div>
      ))}

      <button
        type="button"
        onClick={() => addItem(sectionKey, itemTemplate)}
        style={styles.addButton}
      >
        + Add Item
      </button>
    </SectionCard>
  )
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  )
}

function ImageField({ label, value, onChange, onUpload, compact = false }) {
  return (
    <div style={{ ...styles.field, marginBottom: compact ? 10 : 16 }}>
      <span style={styles.label}>{label}</span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
        placeholder="Image URL"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e.target.files?.[0])}
        style={styles.fileInput}
      />
      {value ? (
        <img src={value} alt="" style={styles.previewImage} />
      ) : null}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  )
}

const styles = {
  wrapper: {
    padding: 24,
    display: "grid",
    gap: 20,
    background: "#f6f7fb",
    minHeight: "100vh",
  },
  headerCard: {
    background: "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
    color: "white",
    borderRadius: 24,
    padding: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    opacity: 0.7,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    margin: "6px 0",
    fontSize: 32,
  },
  subtitle: {
    margin: 0,
    opacity: 0.85,
  },
  slugBox: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
  },
  slugLabel: {
    display: "block",
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  slugValue: {
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 18,
  },
  card: {
    background: "white",
    borderRadius: 22,
    padding: 20,
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 20,
  },
  field: {
    display: "grid",
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#344054",
    textTransform: "capitalize",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 88,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fileInput: {
    fontSize: 13,
  },
  previewImage: {
    width: "100%",
    maxHeight: 180,
    objectFit: "cover",
    borderRadius: 14,
    border: "1px solid #eee",
  },
  subCard: {
    border: "1px solid #eaecf0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    background: "#fafafa",
  },
  subCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  subCardTitle: {
    margin: 0,
    fontWeight: 700,
  },
  addButton: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px dashed #94a3b8",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    cursor: "pointer",
    fontWeight: 700,
  },
  footerBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    background: "white",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
    flexWrap: "wrap",
    position: "sticky",
    bottom: 18,
  },
  saveButton: {
    padding: "14px 22px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
  },
  message: {
    margin: 0,
    fontWeight: 600,
  },
  previewLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
}