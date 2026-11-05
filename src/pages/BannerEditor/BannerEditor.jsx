import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getHeroBanner,
  updateHeroBanner,
  uploadProductImage,
} from "../../services/adminService.js";
import styles from "./BannerEditor.module.css";

function normalizeCampaign(campaign = {}) {
  return {
    id: campaign.id ?? campaign.banner_id,
    imagemUrl:
      campaign.imagem_url || campaign.imagem || campaign.imagemUrl || "",
    frasePromocional:
      campaign.frase_promocional ||
      campaign.tag_desconto ||
      campaign.frasePromocional ||
      "",
    badge: campaign.badge || campaign.selo || "",
    titulo: campaign.titulo || campaign.titulo_principal || "",
    subtitulo: campaign.subtitulo || campaign.descricao || "",
    link: campaign.link || campaign.url || "",
    textoBotao: campaign.texto_botao || campaign.botao || "APROVEITAR AGORA",
    file: null,
    previewUrl: "",
  };
}

function getCampaigns(config) {
  const source = config?.data || config?.banner || config;
  const list =
    source?.campanhas ||
    source?.campaigns ||
    source?.slides ||
    source?.banners;

  if (Array.isArray(list)) return list.map(normalizeCampaign);

  if (Array.isArray(source)) return source.map(normalizeCampaign);

  return [
    normalizeCampaign({
      imagem_url: source?.imagem_url || source?.imagem,
      frase_promocional: source?.frase_promocional || source?.tag_desconto,
    }),
  ];
}

export default function BannerEditor() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedCampaign = campaigns[selectedIndex];

  useEffect(() => {
    getHeroBanner()
      .then((config) => {
        const loadedCampaigns = getCampaigns(config);
        setCampaigns(loadedCampaigns);
        setSelectedIndex(0);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          toast.error("Sua sessão expirou. Faça login novamente como lojista.");
        } else if (error.response?.status !== 404) {
          console.error("Erro ao carregar banners:", error);
          toast.error("Não foi possível carregar as campanhas.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSelected = (changes) => {
    setCampaigns((current) =>
      current.map((campaign, index) =>
        index === selectedIndex ? { ...campaign, ...changes } : campaign,
      ),
    );
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (
      !["image/png", "image/webp"].includes(selectedFile.type) ||
      selectedFile.size > 5 * 1024 * 1024
    ) {
      toast.error("A imagem deve ser PNG ou WEBP e ter até 5 MB.");
      event.target.value = "";
      return;
    }

    updateSelected({
      file: selectedFile,
      previewUrl: URL.createObjectURL(selectedFile),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCampaign) return;

    const frasePromocional = selectedCampaign.frasePromocional.trim();
    if (!frasePromocional) {
      toast.error("Informe a frase da campanha.");
      return;
    }
    if (!selectedCampaign.imagemUrl && !selectedCampaign.file) {
      toast.error("Selecione uma imagem para a campanha.");
      return;
    }

    setSaving(true);
    try {
      const imagemUrl = selectedCampaign.file
        ? await uploadProductImage(selectedCampaign.file)
        : selectedCampaign.imagemUrl;

      const payload = campaigns.map((campaign, index) => ({
        ...(campaign.id ? { id: campaign.id } : {}),
        imagem_url: index === selectedIndex ? imagemUrl : campaign.imagemUrl,
        frase_promocional:
          index === selectedIndex
            ? frasePromocional
            : campaign.frasePromocional.trim(),
        badge: campaign.badge,
        titulo: campaign.titulo,
        subtitulo: campaign.subtitulo,
        link: campaign.link,
        texto_botao: campaign.textoBotao,
      }));

      const saved = await updateHeroBanner({ campanhas: payload });
      const savedCampaigns = getCampaigns(saved);
      setCampaigns(savedCampaigns.length ? savedCampaigns : payload.map(normalizeCampaign));
      toast.success("Campanha atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast.error(
        error.response?.data?.detail || "Não foi possível salvar a campanha.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addCampaign = () => {
    setCampaigns((current) => [...current, normalizeCampaign({}, current.length)]);
    setSelectedIndex(campaigns.length);
  };

  const removeCampaign = () => {
    if (campaigns.length <= 1) {
      toast.error("Mantenha pelo menos uma campanha.");
      return;
    }
    setCampaigns((current) =>
      current.filter((_, index) => index !== selectedIndex),
    );
    setSelectedIndex((current) => Math.max(0, current - 1));
  };

  const imagePreview = selectedCampaign?.previewUrl || selectedCampaign?.imagemUrl;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/admin" className={styles.backLink}>
          <FiArrowLeft /> Voltar ao painel
        </Link>
        <p className={styles.eyebrow}>PAINEL DO LOJISTA</p>
        <h1>Campanhas do banner</h1>
        <p className={styles.subtitle}>
          Selecione uma campanha no menu para visualizar e editar.
        </p>
      </header>

      <section className={styles.card}>
        <div className={styles.campaignSelectorHeader}>
          <label className={styles.selectorLabel} htmlFor="campaign-selector">
            Campanha para editar
            <select
              id="campaign-selector"
              value={selectedIndex}
              onChange={(event) => setSelectedIndex(Number(event.target.value))}
              disabled={loading || !campaigns.length}
            >
              {campaigns.map((campaign, index) => (
                <option value={index} key={campaign.id || index}>
                  Campanha {index + 1}
                  {campaign.frasePromocional
                    ? ` - ${campaign.frasePromocional}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.addButton} onClick={addCampaign}>
            <FiPlus /> Adicionar
          </button>
        </div>

        <h2>Pré-visualização da campanha selecionada</h2>
        {loading ? (
          <p className={styles.loading}>Carregando campanhas...</p>
        ) : imagePreview ? (
          <div className={styles.preview}>
            <img src={imagePreview} alt={`Campanha ${selectedIndex + 1}`} />
            <div className={styles.previewOverlay} />
            <div className={styles.previewContent}>
              <span className={styles.previewBadge}>
                {selectedCampaign.badge || "SELO DA CAMPANHA"}
              </span>
              <h3>
                {selectedCampaign.titulo || "TÍTULO DA CAMPANHA"}
              </h3>
              <p>
                {selectedCampaign.subtitulo || "Descrição da campanha"}
              </p>
              <span className={styles.previewButton}>
                {selectedCampaign.textoBotao || "APROVEITAR AGORA"}
              </span>
            </div>
            <div className={styles.previewTag}>
              {selectedCampaign.frasePromocional || "FRASE DA CAMPANHA"}
            </div>
          </div>
        ) : (
          <div className={styles.emptyPreview}>Selecione uma imagem.</div>
        )}
      </section>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.campaignHeader}>
          <h2>Editar campanha {selectedIndex + 1}</h2>
          <button type="button" className={styles.removeButton} onClick={removeCampaign}>
            <FiTrash2 /> Remover
          </button>
        </div>
        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : selectedCampaign ? (
          <>
            <label>
              Imagem da campanha
              <span className={styles.upload}>
                <FiUploadCloud size={24} />
                <span>
                  {selectedCampaign.file?.name || "Clique para selecionar uma imagem"}
                </span>
                <small>PNG ou WEBP, até 5 MB</small>
                <input
                  type="file"
                  accept=".png,.webp,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </span>
            </label>
            <label>
              Frase da campanha
              <input
                value={selectedCampaign.frasePromocional}
                onChange={(event) =>
                  updateSelected({ frasePromocional: event.target.value })
                }
                placeholder="OFERTA EXCLUSIVA"
              />
            </label>
            <label>
              Selo da campanha
              <input
                value={selectedCampaign.badge}
                onChange={(event) => updateSelected({ badge: event.target.value })}
                placeholder="OFERTA EXCLUSIVA"
              />
            </label>
            <label>
              Título principal
              <input
                value={selectedCampaign.titulo}
                onChange={(event) => updateSelected({ titulo: event.target.value })}
                placeholder="MANTOS OFICIAIS COM ATÉ 40% OFF"
              />
            </label>
            <label>
              Texto da descrição
              <textarea
                value={selectedCampaign.subtitulo}
                onChange={(event) => updateSelected({ subtitulo: event.target.value })}
                placeholder="Descrição da campanha"
                rows="3"
              />
            </label>
            <label>
              Texto do botão
              <input
                value={selectedCampaign.textoBotao}
                onChange={(event) => updateSelected({ textoBotao: event.target.value })}
                placeholder="APROVEITAR AGORA"
              />
            </label>
            <label>
              Link do botão
              <input
                value={selectedCampaign.link}
                onChange={(event) => updateSelected({ link: event.target.value })}
                placeholder="/produtos?ofertas=true"
              />
            </label>
            <button type="submit" className={styles.submit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar campanha selecionada"}
            </button>
          </>
        ) : (
          <p className={styles.loading}>Nenhuma campanha cadastrada.</p>
        )}
      </form>
    </main>
  );
}
