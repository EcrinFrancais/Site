import { createConfigurationModel } from '../domain/configuration';
import { pricingService } from '../logic/pricingService';
import { configurationRepository } from '../infrastructure/configurationRepository';

export function createDraftConfiguration(universId, universTitle) {
  return createConfigurationModel({ universId, universTitle });
}

export function buildConfigurationSnapshot(configuration, overrides = {}, topLevelOverrides = {}) {
  const nextValues = {
    ...configuration.values,
    ...overrides,
  };

  return {
    ...configuration,
    ...topLevelOverrides,
    values: nextValues,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateConfigurationQuote(configuration) {
  return pricingService.calculateQuote({
    ...configuration.values,
    taille: configuration.values.taille,
    quantite: configuration.values.quantite,
    mesures: configuration.values.mesures,
    essence: configuration.values.essence,
    finition: configuration.values.finition,
  });
}

export async function saveConfigurationDraft(configuration, userId) {
  const payload = {
    ...configuration,
    userId: userId || 'anonymous',
    status: configuration.status || 'draft',
    updatedAt: new Date().toISOString(),
    version: Number(configuration.version || 1),
    versions: Array.isArray(configuration.versions) ? configuration.versions : [],
  };

  const snapshot = {
    ...payload,
    values: { ...payload.values },
  };

  if (!payload.versions.some((entry) => entry.version === payload.version)) {
    snapshot.versions = [
      ...payload.versions,
      {
        version: payload.version,
        updatedAt: payload.updatedAt,
        values: { ...payload.values },
      },
    ];
  }

  return configurationRepository.save(snapshot);
}

export async function loadConfigurationById(id) {
  return configurationRepository.getById(id);
}

export async function listConfigurationDrafts(userId) {
  return configurationRepository.listByUser(userId || 'anonymous');
}

export async function deleteConfigurationDraft(id) {
  return configurationRepository.remove(id);
}
