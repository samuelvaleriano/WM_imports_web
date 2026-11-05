import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiImage, FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";
import { api } from "../../services/api.js";
import styles from "./CreatePage.module.css";

const SIZES = ["P", "M", "G", "GG"];
const EMPTY_VARIATIONS = Object.fromEntries(SIZES.map((size) => [size, 0]));

function getErrorMessage(error, fallback) {
  return error.response?.data?.detail || fallback;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    preco: "",
    descricao: "",
    ativo: true,
    categoriaId: "",
    subcategoriaId: "",
    timeId: "",
  });
  const [variacoes, setVariacoes] = useState(EMPTY_VARIATIONS);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/admin/catalog/categories")
      .then(({ data }) => {
        if (active) setCategories(Array.isArray(data) ? data : data.categories || []);
      })
      .catch((error) => {
        console.error("Erro ao carregar categorias:", error);
        toast.error(getErrorMessage(error, "Não foi possível carregar as categorias."));
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.categoriaId) {
      return;
    }
    let active = true;
    api.get("/admin/catalog/subcategories", { params: { categoria_id: form.categoriaId } })
      .then(({ data }) => {
        if (active) setSubcategories(Array.isArray(data) ? data : data.subcategories || []);
      })
      .catch((error) => {
        console.error("Erro ao carregar subcategorias:", error);
        toast.error(getErrorMessage(error, "Não foi possível carregar as subcategorias."));
      })
      .finally(() => { if (active) setSubcategoriesLoading(false); });
    return () => { active = false; };
  }, [form.categoriaId]);

  useEffect(() => {
    if (!form.subcategoriaId) {
      return;
    }
    let active = true;
    api.get("/admin/catalog/teams", { params: { subcategoria_id: form.subcategoriaId } })
      .then(({ data }) => {
        if (active) setTeams(Array.isArray(data) ? data : data.teams || []);
      })
      .catch((error) => {
        console.error("Erro ao carregar times:", error);
        toast.error(getErrorMessage(error, "Não foi possível carregar os times."));
      })
      .finally(() => { if (active) setTeamsLoading(false); });
    return () => { active = false; };
  }, [form.subcategoriaId]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, categoriaId: value, subcategoriaId: "", timeId: "" }));
    setSubcategories([]);
    setTeams([]);
    setSubcategoriesLoading(Boolean(value));
    setTeamsLoading(false);
  };

  const handleSubcategoryChange = (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, subcategoriaId: value, timeId: "" }));
    setTeams([]);
    setTeamsLoading(Boolean(value));
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const validType = ["image/png", "image/webp"].includes(selectedFile.type);
    if (!validType) {
      toast.error("Selecione uma imagem PNG ou WEBP.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleVariation = (size, value) => {
    setVariacoes((current) => ({ ...current, [size]: Math.max(0, Number(value) || 0) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.nome.trim() || !form.preco || !form.timeId || !file) {
      toast.error("Preencha os campos obrigatórios e envie uma imagem.");
      return;
    }
    setSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.append("arquivo", file);
      const { data: uploaded } = await api.post("/admin/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imagemUrl = uploaded.imagem_url || uploaded.url;
      if (!imagemUrl) throw new Error("A API não retornou a URL da imagem.");

      await api.post("/produtos/", {
        nome: form.nome.trim(),
        preco: Number(form.preco),
        descricao: form.descricao.trim(),
        ativo: form.ativo,
        time_id: Number(form.timeId),
        imagem_url: imagemUrl,
        imagem_capa: imagemUrl,
        variacoes: SIZES.map((tamanho) => ({
          tamanho,
          estoque: variacoes[tamanho],
        })),
      });
      toast.success("Produto cadastrado com sucesso.");
      navigate("/admin");
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error(getErrorMessage(error, error.message || "Não foi possível cadastrar o produto."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/admin" className={styles.backLink}><FiArrowLeft /> Voltar ao painel</Link>
        <p className={styles.eyebrow}>PAINEL DO LOJISTA</p>
        <h1>Novo produto</h1>
        <p className={styles.subtitle}>Cadastre uma camisa, sua imagem e as quantidades disponíveis.</p>
      </header>
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2>Informações do produto</h2>
          <div className={styles.grid}>
            <label>Nome *<input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex.: Camisa Flamengo 2026" /></label>
            <label>Preço *<input name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={handleChange} placeholder="199,90" /></label>
            <label className={styles.full}>Descrição<textarea name="descricao" value={form.descricao} onChange={handleChange} rows="4" placeholder="Descreva o produto" /></label>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Classificação</h2>
          <div className={styles.grid}>
            <label>Categoria *<select name="categoriaId" value={form.categoriaId} onChange={handleCategoryChange} disabled={loadingOptions}><option value="">Selecione</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nome || item.name}</option>)}</select></label>
            <label>Subcategoria *<select name="subcategoriaId" value={form.subcategoriaId} onChange={handleSubcategoryChange} disabled={!form.categoriaId || subcategoriesLoading}><option value="">{subcategoriesLoading ? "Carregando..." : "Selecione"}</option>{subcategories.map((item) => <option key={item.id} value={item.id}>{item.nome || item.name}</option>)}</select></label>
            <label>Time *<select name="timeId" value={form.timeId} onChange={handleChange} disabled={!form.subcategoriaId || teamsLoading}><option value="">{teamsLoading ? "Carregando..." : "Selecione"}</option>{teams.map((item) => <option key={item.id} value={item.id}>{item.nome || item.name}</option>)}</select></label>
            <label className={styles.checkbox}><input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} /> Produto ativo</label>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Imagem</h2>
          <label className={styles.dropzone}>
            <FiUploadCloud size={30} />
            <span>{file ? file.name : "Clique para selecionar uma imagem"}</span>
            <small>PNG ou WEBP, até 5 MB</small>
            <input type="file" accept="image/png,image/webp" onChange={(event) => handleFile(event.target.files[0])} />
          </label>
          {preview ? <img className={styles.preview} src={preview} alt="Pré-visualização do produto" /> : <div className={styles.emptyPreview}><FiImage size={28} />Pré-visualização</div>}
        </section>

        <section className={styles.card}>
          <h2>Estoque por tamanho</h2>
          <div className={styles.sizes}>{SIZES.map((size) => <label key={size}>{size}<input type="number" min="0" value={variacoes[size]} onChange={(event) => handleVariation(size, event.target.value)} /></label>)}</div>
        </section>

        <button className={styles.submit} type="submit" disabled={saving}>{saving ? "Salvando..." : "Cadastrar produto"}</button>
      </form>
    </main>
  );
}
