"use client";

import { useState, useRef } from "react";
import { services as initialServices, categories, industries } from "@/lib/data";
import type { Service } from "@/lib/data";
import { parseExcel } from "@/lib/excel";
import type { ParseResult } from "@/lib/excel";
import {
  Plus, Search, X, Star, Save, Trash2,
  ChevronRight, AlertCircle, Download, Upload,
  CheckCircle2, FileSpreadsheet,
} from "lucide-react";

/* ─── helpers ──────────────────────────────────────────── */

const categoryLabel: Record<string, string> = {
  store: "스토어", place: "플레이스", app: "앱",
  seo: "SEO", sns: "SNS", blog: "블로그",
  ad: "검색광고", etc: "기타",
};

const categoryColors: Record<string, string> = {
  store: "bg-blue-50 text-blue-600",
  place: "bg-green-50 text-green-600",
  app:   "bg-purple-50 text-purple-600",
  seo:   "bg-orange-50 text-orange-600",
  sns:   "bg-pink-50 text-pink-600",
  blog:  "bg-teal-50 text-teal-600",
  ad:    "bg-red-50 text-red-600",
  etc:   "bg-slate-100 text-slate-600",
};

const badgeColors: Record<string, string> = {
  인기: "bg-orange-50 text-orange-600 border border-orange-200",
  신규: "bg-green-50 text-green-600 border border-green-200",
  추천: "bg-blue-50 text-blue-600 border border-blue-200",
};

const emptyForm = (): Omit<Service, "id"> => ({
  title: "",
  category: "store",
  subcategory: "",
  industry: [],
  price: 0,
  priceUnit: "건",
  rating: 5.0,
  reviewCount: 0,
  badge: undefined,
  description: "",
  tags: [],
});

/* ─── main component ────────────────────────────────────── */

export default function AdminServicesPage() {
  const [serviceList, setServiceList] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, "id">>(emptyForm());
  const [tagInput, setTagInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xlResult, setXlResult] = useState<ParseResult | null>(null);
  const [xlLoading, setXlLoading] = useState(false);
  const [xlModal, setXlModal] = useState(false);

  /* filtered list */
  const filtered = serviceList.filter((s) => {
    const matchCat = catFilter === "all" || s.category === catFilter;
    const matchQ = !search || s.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  /* open panel for new */
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setTagInput("");
    setPanelOpen(true);
  };

  /* open panel for edit */
  const openEdit = (svc: Service) => {
    setEditingId(svc.id);
    setForm({
      title: svc.title,
      category: svc.category,
      subcategory: svc.subcategory,
      industry: svc.industry ?? [],
      price: svc.price,
      priceUnit: svc.priceUnit,
      rating: svc.rating,
      reviewCount: svc.reviewCount,
      badge: svc.badge,
      description: svc.description,
      tags: [...svc.tags],
    });
    setTagInput("");
    setPanelOpen(true);
  };

  /* save */
  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setServiceList((prev) =>
        prev.map((s) => (s.id === editingId ? { ...form, id: editingId } : s))
      );
    } else {
      const newId = `custom-${Date.now()}`;
      setServiceList((prev) => [{ ...form, id: newId }, ...prev]);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setPanelOpen(false);
    }, 800);
  };

  /* delete */
  const handleDelete = (id: string) => {
    setServiceList((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
    if (editingId === id) setPanelOpen(false);
  };

  /* Excel handlers */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setXlLoading(true);
    try {
      const result = await parseExcel(file);
      setXlResult(result);
      setXlModal(true);
    } catch {
      alert("파일을 읽을 수 없습니다. 올바른 CSV 파일인지 확인해주세요.");
    } finally {
      setXlLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleXlConfirm = () => {
    if (!xlResult) return;
    setServiceList((prev) => [...xlResult.ok, ...prev]);
    setXlModal(false);
    setXlResult(null);
  };

  /* tag helpers */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── LEFT: List ──────────────────────────────── */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ${panelOpen ? "lg:mr-[440px]" : ""}`}>

        {/* Toolbar */}
        <div className="shrink-0 px-6 py-5 bg-white border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-slate-900">서비스 관리</h1>
              <p className="text-xs text-slate-500 mt-0.5">총 {serviceList.length}개 등록됨</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 엑셀 양식 다운로드 */}
              <a
                href="/api/admin/excel-template"
                download
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                양식 다운로드
              </a>

              {/* 엑셀 업로드 */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={xlLoading}
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-green-300 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {xlLoading ? "읽는 중..." : "CSV 업로드"}
              </button>

              {/* 개별 추가 */}
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                직접 추가
              </button>
            </div>
          </div>

          {/* Search + Category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="서비스명으로 검색..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setCatFilter("all")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  catFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                전체
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    catFilter === c.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-sm text-slate-400 font-medium">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => openEdit(svc)}
                  className={`text-left p-4 bg-white rounded-2xl border transition-all hover:shadow-sm ${
                    editingId === svc.id
                      ? "border-blue-300 ring-2 ring-blue-100"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[svc.category]}`}>
                      {categoryLabel[svc.category]}
                    </span>
                    {svc.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[svc.badge]}`}>
                        {svc.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug mb-2">
                    {svc.title}
                  </p>

                  {/* Price + Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {svc.price.toLocaleString()}원
                      <span className="text-xs font-normal text-slate-400 ml-0.5">~/{svc.priceUnit}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{svc.rating}</span>
                    </div>
                  </div>

                  {/* Edit hint */}
                  <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400">
                    <ChevronRight className="w-3 h-3" />
                    클릭하여 편집
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Edit Panel ────────────────────────── */}
      {panelOpen && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setPanelOpen(false)}
          />

          <aside className="fixed right-0 top-16 bottom-0 z-40 w-full max-w-[440px] bg-white border-l border-slate-100 flex flex-col shadow-xl">

            {/* Panel Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">
                {editingId ? "서비스 편집" : "새 서비스 추가"}
              </h2>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    onClick={() => setDeleteConfirm(editingId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                )}
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* ① 기본 정보 */}
              <Section title="① 기본 정보">
                <Field label="서비스 이름" required>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="예: 네이버 플레이스 상위노출"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="카테고리" required>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={inputCls}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="세부 분류">
                    <input
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      placeholder="예: 네이버 플레이스"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="서비스 설명">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="고객에게 보여줄 서비스 설명을 입력하세요"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </Section>

              {/* ② 가격 */}
              <Section title="② 가격 설정">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="기본 가격 (원)" required>
                    <input
                      type="number"
                      min={0}
                      value={form.price || ""}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="10000"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="단위">
                    <select
                      value={form.priceUnit}
                      onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
                      className={inputCls}
                    >
                      {["건", "월", "일", "회"].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {form.price > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700 mb-1.5">티어별 자동 계산 (참고)</p>
                    {[
                      { name: "스타터", mul: 1 },
                      { name: "스탠다드", mul: 2.5 },
                      { name: "프로", mul: 6 },
                    ].map((t) => (
                      <div key={t.name} className="flex justify-between">
                        <span className="text-slate-500">{t.name}</span>
                        <span className="font-semibold">{(form.price * t.mul).toLocaleString()}원~</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ③ 태그 & 뱃지 */}
              <Section title="③ 태그 · 뱃지">
                <Field label="뱃지">
                  <div className="flex gap-2">
                    {(["인기", "신규", "추천", "없음"] as const).map((b) => {
                      const active = b === "없음" ? !form.badge : form.badge === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, badge: b === "없음" ? undefined : b })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? b === "없음"
                                ? "bg-slate-900 text-white border-slate-900"
                                : b === "인기"
                                ? "bg-orange-500 text-white border-orange-500"
                                : b === "신규"
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="태그">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="태그 입력 후 Enter 또는 추가 클릭"
                        className={`${inputCls} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {form.tags.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                          >
                            {t}
                            <button onClick={() => removeTag(t)} className="text-slate-400 hover:text-slate-700">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </Section>

              {/* ④ 업종 연결 */}
              <Section title="④ 업종 연결 (선택)">
                <p className="text-xs text-slate-500 -mt-2 mb-2">
                  해당 서비스가 적합한 업종을 선택하면 업종별 탭에 노출됩니다
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((ind) => {
                    const checked = form.industry?.includes(ind.id) ?? false;
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => {
                          const cur = form.industry ?? [];
                          setForm({
                            ...form,
                            industry: checked
                              ? cur.filter((x) => x !== ind.id)
                              : [...cur, ind.id],
                          });
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                          checked
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${checked ? "bg-blue-500" : "bg-slate-100"}`}>
                          {checked && <span className="text-white text-[10px] leading-none">✓</span>}
                        </div>
                        {ind.name}
                      </button>
                    );
                  })}
                </div>
              </Section>

            </div>

            {/* Panel Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              {!form.title.trim() && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600 mb-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  서비스 이름은 필수입니다
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  saved
                    ? "bg-green-600 text-white"
                    : form.title.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "저장됨!" : editingId ? "변경 저장" : "서비스 추가"}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Excel Upload Result Modal */}
      {xlModal && xlResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">CSV 업로드 결과</h2>
                <p className="text-xs text-slate-500 mt-0.5">등록 전 내용을 확인해주세요</p>
              </div>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-600">{xlResult.ok.length}개</div>
                <div className="text-xs text-green-700 font-medium mt-0.5">등록 가능</div>
              </div>
              <div className={`p-4 rounded-xl border ${xlResult.errors.length ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                <div className={`text-2xl font-bold ${xlResult.errors.length ? "text-red-500" : "text-slate-400"}`}>
                  {xlResult.errors.length}개
                </div>
                <div className={`text-xs font-medium mt-0.5 ${xlResult.errors.length ? "text-red-600" : "text-slate-400"}`}>
                  오류 (건너뜀)
                </div>
              </div>
            </div>

            {/* OK preview */}
            {xlResult.ok.length > 0 && (
              <div className="px-6 pb-2">
                <p className="text-xs font-semibold text-slate-500 mb-2">등록될 서비스 (최대 5개 미리보기)</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {xlResult.ok.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-slate-800 font-medium truncate flex-1">{s.title}</span>
                      <span className="text-xs text-slate-400 shrink-0">{s.price.toLocaleString()}원</span>
                    </div>
                  ))}
                  {xlResult.ok.length > 5 && (
                    <p className="text-xs text-slate-400 text-center py-1">
                      외 {xlResult.ok.length - 5}개 더...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Errors */}
            {xlResult.errors.length > 0 && (
              <div className="px-6 pb-2 mt-2">
                <p className="text-xs font-semibold text-red-500 mb-2">오류 내역</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {xlResult.errors.map((e) => (
                    <div key={e.row} className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-red-600">{e.row}행</span>
                        <span className="text-xs text-red-500 ml-1.5">{e.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 px-6 py-5 border-t border-slate-100">
              <button
                onClick={() => { setXlModal(false); setXlResult(null); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleXlConfirm}
                disabled={xlResult.ok.length === 0}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {xlResult.ok.length}개 등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-bold text-slate-900 mb-1">서비스를 삭제할까요?</p>
            <p className="text-xs text-slate-500 mb-5">
              {serviceList.find((s) => s.id === deleteConfirm)?.title}
              <br />삭제 후에는 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── tiny helpers ──────────────────────────────────────── */

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
