import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfigurationPanel({
  styles,
  taille,
  setTaille,
  mesures,
  setMesures,
  essence,
  setEssence,
  finition,
  setFinition,
  couleurLaque,
  setCouleurLaque,
  cales,
  setCales,
  couleurVelours,
  setCouleurVelours,
  fermeture,
  setFermeture,
  gravureType,
  setGravureType,
  fontStyle,
  setFontStyle,
  tailleTexte,
  setTailleTexte,
  tailleImage,
  setTailleImage,
  posX,
  setPosX,
  posY,
  setPosY,
  quantite,
  setQuantite,
  viewSize,
  setViewSize,
  texteGravure,
  setTexteGravure,
  modeGravure,
  setModeGravure,
  handleUploadImage,
  quote,
  vinsConfig,
  onOrder,
  orderPending,
  title,
}) {
  const { t } = useTranslation('configurator');
  return (
    <div style={styles.leftPanel}>
      <div style={styles.configContainer}>
        <h1 style={styles.title}>{title}</h1>

        <div style={{ ...styles.sectionCard, paddingTop: '16px' }}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.sizeFinish')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.boxSize')}</label>
              <select
                value={taille}
                onChange={(e) => setTaille(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.tailles.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    {t(`tailles.${tItem.id}`, tItem.label)}
                  </option>
                ))}
              </select>
              {taille === 'sur_mesure' && (
                <div style={styles.inlineInputs}>
                  <input
                    type="number"
                    placeholder={t('labels.lengthPlaceholder')}
                    onChange={(e) => setMesures({ ...mesures, L: e.target.value })}
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder={t('labels.widthPlaceholder')}
                    onChange={(e) => setMesures({ ...mesures, l: e.target.value })}
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder={t('labels.heightPlaceholder')}
                    onChange={(e) => setMesures({ ...mesures, h: e.target.value })}
                    style={styles.minimalInput}
                  />
                </div>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.wood')}</label>
              <select
                value={essence}
                onChange={(e) => setEssence(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.essences.map((b) => (
                  <option key={b} value={b}>
                    {t(`essences.${b}`, b)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.finish')}</label>
              <select
                value={finition}
                onChange={(e) => setFinition(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.finitions.map((f) => (
                  <option key={f} value={f}>
                    {t(`finitions.${f}`, f)}
                  </option>
                ))}
              </select>
              {finition === 'Laque' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <label style={styles.label}>{t('labels.color')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['#800020', '#000000', '#ffffff', '#003366', '#214e34'].map(
                      (color) => (
                        <button
                          key={color}
                          onClick={() => setCouleurLaque(color)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            border:
                              couleurLaque === color
                                ? '2px solid #d4af37'
                                : '1px solid #333',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        />
                      )
                    )}
                  </div>
                  <input
                    type="color"
                    value={couleurLaque}
                    onChange={(e) => setCouleurLaque(e.target.value)}
                    style={styles.colorPicker}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.layout')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.padding')}</label>
              <select
                value={cales}
                onChange={(e) => setCales(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.cales.map((c) => (
                  <option key={c} value={c}>
                    {t(`cales.${c}`, c)}
                  </option>
                ))}
              </select>
              {cales === 'Velours' && (
                <select
                  value={couleurVelours}
                  onChange={(e) => setCouleurVelours(e.target.value)}
                  style={{ ...styles.minimalSelect, marginTop: '6px' }}
                >
                  {vinsConfig.veloursColors.map((c) => (
                    <option key={c} value={c}>
                      {t(`veloursColors.${c}`, c)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.closure')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.closureType')}</label>
              <select
                value={fermeture}
                onChange={(e) => setFermeture(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.fermetures.map((f) => (
                  <option key={f} value={f}>
                    {t(`fermetures.${f}`, f)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.engraving')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.engravingType')}</label>
              <select
                value={gravureType}
                onChange={(e) => setGravureType(e.target.value)}
                style={styles.minimalSelect}
              >
                {vinsConfig.gravureTypes.map((g) => (
                  <option key={g} value={g}>
                    {t(`gravureTypes.${g}`, g)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {gravureType !== 'Aucune' && (
            <div style={styles.engravingCard}>
              <label style={styles.label}>{t('labels.engravingCustomization')}</label>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '4px',
                  marginBottom: '6px',
                }}
              >
                <button
                  onClick={() => setModeGravure('texte')}
                  style={{
                    ...styles.minimalSelect,
                    width: '50%',
                    padding: '8px 10px',
                    border:
                      modeGravure === 'texte'
                        ? '1px solid #d4af37'
                        : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {t('labels.modeText')}
                </button>
                <button
                  onClick={() => setModeGravure('image')}
                  style={{
                    ...styles.minimalSelect,
                    width: '50%',
                    padding: '8px 10px',
                    border:
                      modeGravure === 'image'
                        ? '1px solid #d4af37'
                        : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {t('labels.modeImage')}
                </button>
              </div>

              {modeGravure === 'texte' ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <input
                    type="text"
                    value={texteGravure}
                    onChange={(e) => setTexteGravure(e.target.value)}
                    placeholder={t('labels.textPlaceholder')}
                    style={styles.minimalInput}
                  />

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ width: '48%', minWidth: '140px' }}>
                      <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                        {t('labels.font')}
                      </label>
                      <select
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value)}
                        style={styles.minimalSelect}
                      >
                        <option value="Serif">{t('labels.fontSerif')}</option>
                        <option value="SansSerif">{t('labels.fontSansSerif')}</option>
                        <option value="Script">{t('labels.fontScript')}</option>
                      </select>
                    </div>
                    <div style={{ width: '48%', minWidth: '140px' }}>
                      <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                        {t('labels.textSize', { value: tailleTexte })}
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={tailleTexte}
                        onChange={(e) => setTailleTexte(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleUploadImage}
                    style={{
                      ...styles.minimalInput,
                      fontSize: '0.8rem',
                      color: '#888',
                    }}
                  />
                  <div>
                    <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                      {t('labels.imageZoom', { value: tailleImage })}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={tailleImage}
                      onChange={(e) => setTailleImage(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '12px',
                }}
              >
                <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                  {t('labels.positionHorizontal')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(e.target.value)}
                  style={{ width: '100%', marginBottom: '10px' }}
                />

                <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                  {t('labels.positionVertical')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={styles.summaryCard}>
          <div>
            <div style={styles.summaryLabel}>{t('labels.quantity')}</div>
            <div style={styles.summaryValue}>{quantite}</div>
          </div>
          <div>
            <div style={styles.summaryLabel}>{t('labels.estimate')}</div>
            <div style={styles.summaryValue}>{quote.totalTTC} € TTC</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={styles.summaryLabel}>{t('labels.preview3d')}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {['petit', 'moyen', 'grand'].map((value) => (
                <button
                  key={value}
                  onClick={() => setViewSize(value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: viewSize === value ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                    background: viewSize === value ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
                    color: '#f7efe3',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontSize: '0.78rem',
                  }}
                >
                  {t(`viewSize.${value}`, value)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={styles.summaryLabel}>{t('labels.qty')}</label>
            <input
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              style={{
                ...styles.minimalInput,
                width: '70px',
                textAlign: 'center',
                padding: '8px 10px',
              }}
            />
          </div>
        </div>

        <div style={styles.footer}>
          <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>
            {t('footerHint')}
          </div>
          <button
            style={{ ...styles.orderButton, opacity: orderPending ? 0.6 : 1, cursor: orderPending ? 'not-allowed' : 'pointer' }}
            onClick={onOrder}
            disabled={orderPending}
          >
            {orderPending ? t('sending') : t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
