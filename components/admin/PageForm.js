"use client"

import { useMemo, useState } from "react"
import { API_URL, getSiteOrigin } from "../../lib/config"

const apiBase = API_URL

const emptyReview = { image: "", text: "", name: "" }
const emptyMenu = { name: "", desc: "", price: "", image: "" }

function buildInitialData(initialData = {}, whatsapp = "") {
  return {
    brandName: initialData.brandName || "",
    hero: {
      title: initialData.hero?.title || "",
      subtitle: initialData.hero?.subtitle || "",
      image: initialData.hero?.image || "",
    },
    pain: {
      title: initialData.pain?.title || "",
      subtitle: initialData.pain?.subtitle || "",
      image: initialData.pain?.image || "",
      points: initialData.pain?.points?.length ? initialData.pain.points : ["", "", ""],
    },
    videos: initialData.videos?.length ? initialData.videos : [{ url: "" }],
    videoTitle: initialData.videoTitle || "",
    proImageTitle: initialData.proImageTitle || "",
    proImage: initialData.proImage || "",
    reviews: {
      title: initialData.reviews?.title || "",
      image: initialData.reviews?.image || "",
      items: initialData.reviews?.items?.length
        ? initialData.reviews.items
        : [{ ...emptyReview }, { ...emptyReview }, { ...emptyReview }],
    },
    menuTitle: initialData.menuTitle || "",
    menu: initialData.menu?.length
      ? initialData.menu
      : [{ ...emptyMenu }, { ...emptyMenu }, { ...emptyMenu }],
    cta: {
      title: initialData.cta?.title || "",
      subtitle: initialData.cta?.subtitle || "",
      buttonText: initialData.cta?.buttonText || "",
      whatsapp: initialData.cta?.whatsapp || whatsapp || "",
    },
  }
}

const PACKAGE_SECTIONS = {
  starter: ["basic", "hero", "cta"],
  pro: ["basic", "hero", "pain", "reviews", "cta"],
  proplus: ["basic", "hero", "pain", "video", "reviews", "menu", "cta"],
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
    name: initialForm?.name || "",
    whatsapp: initialForm?.whatsapp || "",
    plan: initialForm?.plan || initialForm?.packageType || "starter",
  })

  const [data, setData] = useState(() =>
    buildInitialData(initialData, initialForm?.whatsapp)
  )
  const [result, setResult] = useState(
    slug ? `${getSiteOrigin()}/${slug}` : ""
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Landing Page" : "Create Landing Page"),
    [mode]
  )

  const visibleSections = PACKAGE_SECTIONS[form.plan] || PACKAGE_SECTIONS.starter
  const showSection = (key) => visibleSections.includes(key)

  const setTopField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateSectionField = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const updateArrayField = (path, index, field, value) => {
    setData((prev) => {
      const keys = path.split(".")
      const rootKey = keys[0]

      if (keys.length === 1) {
        const currentArray = Array.isArray(prev[rootKey]) ? prev[rootKey] : []
        const next = [...currentArray]

        if (!next[index]) next[index] = {}
        next[index] = {
          ...next[index],
          [field]: value,
        }

        return {
          ...prev,
          [rootKey]: next,
        }
      }

      if (keys.length === 2) {
        const parentKey = keys[0]
        const childKey = keys[1]
        const parentObject =
          prev[parentKey] && typeof prev[parentKey] === "object" ? prev[parentKey] : {}

        const currentArray = Array.isArray(parentObject[childKey])
          ? parentObject[childKey]
          : []

        const next = [...currentArray]

        if (!next[index]) next[index] = {}
        next[index] = {
          ...next[index],
          [field]: value,
        }

        return {
          ...prev,
          [parentKey]: {
            ...parentObject,
            [childKey]: next,
          },
        }
      }

      return prev
    })
  }

  const updatePainPoint = (index, value) => {
    setData((prev) => {
      const currentPoints = Array.isArray(prev.pain?.points) ? prev.pain.points : ["", "", ""]
      const nextPoints = [...currentPoints]
      nextPoints[index] = value

      return {
        ...prev,
        pain: {
          ...prev.pain,
          points: nextPoints,
        },
      }
    })
  }

  const handleUpload = async (file, apply) => {
    if (!file) return

    const body = new FormData()
    body.append("image", file)

    try {
      setMessage("Uploading image...")
      const res = await fetch(`${apiBase}/api/admin/upload`, {
        method: "POST",
        body,
        credentials: "include",
      })

      const json = await res.json()
      if (!res.ok || !json.url) {
        throw new Error(json.message || json.error || "Upload failed")
      }

      apply(json.url)
      setMessage("Image uploaded")
    } catch (error) {
      setMessage(error.message || "Upload failed")
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

      const method = mode === "edit" ? "PUT" : "POST"

      const payload = {
        name: form.name,
        whatsapp: form.whatsapp,
        packageType: form.plan,
        data: {
          ...data,
          cta: {
            ...data.cta,
            whatsapp: data.cta.whatsapp || form.whatsapp,
          },
        },
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Save failed")

      const finalSlug = json.slug || json.page?.slug || slug
      if (finalSlug) {
        setResult(`${getSiteOrigin()}/${finalSlug}`)
      }

      setMessage(mode === "edit" ? "Saved successfully" : "Page created successfully")
      onSuccess?.(json)
    } catch (error) {
      setMessage(error.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerCard}>
        <div>
          <p style={styles.eyebrow}>{mode === "edit" ? "Customer editor" : "New landing page"}</p>
          <h1 style={styles.title}>{pageTitle}</h1>
          <p style={styles.subtitle}>
            先选 package，再显示相应要填的栏位，助理会更容易操作。
          </p>
        </div>

        {slug ? (
          <div style={styles.slugBox}>
            <span style={styles.slugLabel}>Slug</span>
            <span style={styles.slugValue}>/{slug}</span>
          </div>
        ) : null}
      </div>

      <div style={styles.packageGuide}>
        <div style={styles.packageGuideText}>
          <p style={styles.packageGuideMini}>Current Package</p>
          <h3 style={styles.packageGuideTitle}>{form.plan}</h3>
          <p style={styles.packageGuideDesc}>
            {form.plan === "starter" && "只显示基础转化栏位：Basic、Hero、CTA"}
            {form.plan === "pro" && "显示进阶栏位：Basic、Hero、Pain、Reviews、CTA"}
            {form.plan === "proplus" && "显示完整高阶栏位：全部 section"}
          </p>
        </div>

        <div style={styles.planRow}>
          {["starter", "pro", "proplus"].map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setTopField("plan", plan)}
              style={{
                ...styles.planButton,
                ...(form.plan === plan ? styles.planButtonActive : {}),
              }}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        {showSection("basic") && (
          <SectionCard title="Basic">
            <Field label="品牌名">
              <input
                value={form.name}
                onChange={(e) => setTopField("name", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="WhatsApp">
              <input
                value={form.whatsapp}
                onChange={(e) => setTopField("whatsapp", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="Brand Name（Header 显示）">
              <input
                value={data.brandName}
                onChange={(e) => setData((prev) => ({ ...prev, brandName: e.target.value }))}
                style={styles.input}
              />
            </Field>
          </SectionCard>
        )}

        {showSection("hero") && (
          <SectionCard title="Hero">
            <Field label="标题">
              <input
                value={data.hero.title}
                onChange={(e) => updateSectionField("hero", "title", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="副标题">
              <input
                value={data.hero.subtitle}
                onChange={(e) => updateSectionField("hero", "subtitle", e.target.value)}
                style={styles.input}
              />
            </Field>

            <ImageField
              label="Hero 图片"
              value={data.hero.image}
              onChange={(value) => updateSectionField("hero", "image", value)}
              onUpload={(file) =>
                handleUpload(file, (url) => updateSectionField("hero", "image", url))
              }
            />
          </SectionCard>
        )}

        {showSection("pain") && (
          <SectionCard title="Pain / Problem">
            <Field label="Section 标题">
              <input
                value={data.pain.title}
                onChange={(e) => updateSectionField("pain", "title", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="Section 副标题">
              <input
                value={data.pain.subtitle}
                onChange={(e) => updateSectionField("pain", "subtitle", e.target.value)}
                style={styles.input}
              />
            </Field>

            <ImageField
              label="Pain 图片"
              value={data.pain.image}
              onChange={(value) => updateSectionField("pain", "image", value)}
              onUpload={(file) =>
                handleUpload(file, (url) => updateSectionField("pain", "image", url))
              }
            />

            {data.pain.points.map((point, index) => (
              <Field key={index} label={`问题 ${index + 1}`}>
                <input
                  value={point}
                  onChange={(e) => updatePainPoint(index, e.target.value)}
                  style={styles.input}
                />
              </Field>
            ))}
          </SectionCard>
        )}

        {showSection("video") && (
          <SectionCard title="Video / Pro Image">
            <Field label="Video 标题">
              <input
                value={data.videoTitle}
                onChange={(e) => setData((prev) => ({ ...prev, videoTitle: e.target.value }))}
                style={styles.input}
              />
            </Field>

            <Field label="YouTube URL 1">
              <input
                value={data.videos[0]?.url || ""}
                onChange={(e) => updateArrayField("videos", 0, "url", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="Pro 图片标题">
              <input
                value={data.proImageTitle}
                onChange={(e) => setData((prev) => ({ ...prev, proImageTitle: e.target.value }))}
                style={styles.input}
              />
            </Field>

            <ImageField
              label="Pro 展示图"
              value={data.proImage}
              onChange={(value) => setData((prev) => ({ ...prev, proImage: value }))}
              onUpload={(file) =>
                handleUpload(file, (url) => setData((prev) => ({ ...prev, proImage: url })))
              }
            />
          </SectionCard>
        )}

        {showSection("reviews") && (
          <SectionCard title="Reviews">
            <Field label="Review 标题">
              <input
                value={data.reviews.title}
                onChange={(e) => updateSectionField("reviews", "title", e.target.value)}
                style={styles.input}
              />
            </Field>

            <ImageField
              label="Review Section 图片"
              value={data.reviews.image}
              onChange={(value) => updateSectionField("reviews", "image", value)}
              onUpload={(file) =>
                handleUpload(file, (url) => updateSectionField("reviews", "image", url))
              }
            />

            {data.reviews.items.map((item, index) => (
              <div key={index} style={styles.subCard}>
                <p style={styles.subCardTitle}>Review {index + 1}</p>

                <ImageField
                  label="图片"
                  value={item.image || ""}
                  onChange={(value) => updateArrayField("reviews.items", index, "image", value)}
                  onUpload={(file) =>
                    handleUpload(file, (url) =>
                      updateArrayField("reviews.items", index, "image", url)
                    )
                  }
                  compact
                />

                <Field label="内容">
                  <input
                    value={item.text || ""}
                    onChange={(e) =>
                      updateArrayField("reviews.items", index, "text", e.target.value)
                    }
                    style={styles.input}
                  />
                </Field>

                <Field label="名字">
                  <input
                    value={item.name || ""}
                    onChange={(e) =>
                      updateArrayField("reviews.items", index, "name", e.target.value)
                    }
                    style={styles.input}
                  />
                </Field>
              </div>
            ))}
          </SectionCard>
        )}

        {showSection("menu") && (
          <SectionCard title="Menu">
            <Field label="Menu 标题">
              <input
                value={data.menuTitle}
                onChange={(e) => setData((prev) => ({ ...prev, menuTitle: e.target.value }))}
                style={styles.input}
              />
            </Field>

            {data.menu.map((item, index) => (
              <div key={index} style={styles.subCard}>
                <p style={styles.subCardTitle}>Menu {index + 1}</p>

                <Field label="产品名">
                  <input
                    value={item.name || ""}
                    onChange={(e) => updateArrayField("menu", index, "name", e.target.value)}
                    style={styles.input}
                  />
                </Field>

                <Field label="描述">
                  <input
                    value={item.desc || ""}
                    onChange={(e) => updateArrayField("menu", index, "desc", e.target.value)}
                    style={styles.input}
                  />
                </Field>

                <Field label="价格">
                  <input
                    value={item.price || ""}
                    onChange={(e) => updateArrayField("menu", index, "price", e.target.value)}
                    style={styles.input}
                  />
                </Field>

                <ImageField
                  label="图片"
                  value={item.image || ""}
                  onChange={(value) => updateArrayField("menu", index, "image", value)}
                  onUpload={(file) =>
                    handleUpload(file, (url) => updateArrayField("menu", index, "image", url))
                  }
                  compact
                />
              </div>
            ))}
          </SectionCard>
        )}

        {showSection("cta") && (
          <SectionCard title="CTA">
            <Field label="标题">
              <input
                value={data.cta.title}
                onChange={(e) => updateSectionField("cta", "title", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="副标题">
              <input
                value={data.cta.subtitle}
                onChange={(e) => updateSectionField("cta", "subtitle", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="按钮文字">
              <input
                value={data.cta.buttonText}
                onChange={(e) => updateSectionField("cta", "buttonText", e.target.value)}
                style={styles.input}
              />
            </Field>

            <Field label="CTA WhatsApp">
              <input
                value={data.cta.whatsapp}
                onChange={(e) => updateSectionField("cta", "whatsapp", e.target.value)}
                style={styles.input}
              />
            </Field>
          </SectionCard>
        )}
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
        value={value}
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
  },
  headerCard: {
    background: "linear-gradient(135deg, #151515 0%, #262f45 100%)",
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
  packageGuide: {
    background: "white",
    borderRadius: 22,
    padding: 20,
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  packageGuideText: {
    display: "grid",
    gap: 6,
  },
  packageGuideMini: {
    margin: 0,
    fontSize: 12,
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  packageGuideTitle: {
    margin: 0,
    fontSize: 24,
    textTransform: "capitalize",
  },
  packageGuideDesc: {
    margin: 0,
    color: "#475467",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    outline: "none",
  },
  fileInput: {
    fontSize: 13,
  },
  planRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  planButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #d0d5dd",
    background: "#fff",
    cursor: "pointer",
    textTransform: "capitalize",
  },
  planButtonActive: {
    background: "#111827",
    color: "white",
    border: "1px solid #111827",
  },
  subCard: {
    border: "1px solid #eaecf0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    background: "#fafafa",
  },
  subCardTitle: {
    margin: "0 0 12px",
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