import type { RegionId } from '@/types/common'
import type { SecretRealmDefinition, SecretRealmReward } from '@/types/content'
import type { GameSaveData } from '@/types/state'
import type { TrainingMode, TrainingSecretRealmEntry } from '@/types/training'
import type { ContentRegistry } from '@/data/registry'
import { applyEffects } from './effects'
import { grantGeneratedGear, gearPower, qualityTier } from './gear'
import { RESOURCE_LABELS } from './labels'
import { Rng } from './rng'

export const SECRET_REALM_LIMITS: Record<TrainingMode, number> = {
  steady: 1,
  deep: 2,
  perilous: 3,
}

/** 每场交手后都可能撞见；越凶的地域，旧路越容易把人带偏。 */
export function secretRealmChance(mode: TrainingMode, regionDanger: number): number {
  const base = mode === 'steady' ? 0.055 : mode === 'deep' ? 0.08 : 0.11
  return Math.min(0.2, base + Math.max(0, regionDanger) * 0.006)
}

export interface SecretRealmOutcome {
  state: GameSaveData
  entry: TrainingSecretRealmEntry
  gearIds: string[]
  bestGearId?: string
}

function eligibleRealms(
  state: GameSaveData,
  registry: ContentRegistry,
  regionId: RegionId,
  tierCap: number,
  exclude: ReadonlySet<string>,
): SecretRealmDefinition[] {
  const era = state.campaign.currentEra
  return [...registry.secretRealms.values()].filter(
    (realm) =>
      realm.eraId === era &&
      realm.regionIds.includes(regionId) &&
      realm.tier <= tierCap &&
      realm.weight > 0 &&
      !exclude.has(realm.id),
  )
}

function duplicateCultivation(tier: number): number {
  return 60 + tier * 30
}

function rollAmount(rng: Rng, min: number | undefined, max: number | undefined, fallback = 1): number {
  const low = Math.max(0, Math.floor(min ?? fallback))
  const high = Math.max(low, Math.floor(max ?? low))
  return rng.nextInt(low, high + 1)
}

/**
 * Applies one reward and returns the new save plus a player-facing line.
 * Duplicate养成物 is deliberately turned into cultivation instead of vanishing.
 */
function applyReward(
  state: GameSaveData,
  reward: SecretRealmReward,
  realmTier: number,
  regionId: RegionId,
  rng: Rng,
  registry: ContentRegistry,
): { state: GameSaveData; text: string; gearId?: string; gearName?: string } {
  const tier = reward.gearTier ?? realmTier

  switch (reward.kind) {
    case 'item': {
      const amount = Math.max(1, rollAmount(rng, reward.countMin, reward.countMax))
      const item = registry.getItem(reward.itemId ?? '')
      if (!item || !reward.itemId) return { state, text: '一段认不出的旧物' }
      const next = applyEffects(state, [
        { kind: 'grantItem', itemId: reward.itemId, count: amount },
      ])
      return { state: next, text: `${item.name} ×${amount}` }
    }
    case 'resource': {
      const amount = Math.max(1, rollAmount(rng, reward.amountMin, reward.amountMax))
      const resource = reward.resource ?? 'spirit_stones'
      const next = applyEffects(state, [
        { kind: 'changeResource', resource, amount },
      ])
      return {
        state: next,
        text: `${RESOURCE_LABELS[resource] ?? '物料'} +${amount}`,
      }
    }
    case 'cultivation': {
      const amount = Math.max(0, rollAmount(rng, reward.cultivationMin, reward.cultivationMax))
      const next = applyEffects(state, [{ kind: 'gainCultivation', amount }])
      return { state: next, text: `修为 +${amount}` }
    }
    case 'technique': {
      const technique = reward.techniqueId
        ? registry.techniques.get(reward.techniqueId)
        : undefined
      if (!technique) return { state, text: '一段读不通的残章' }
      if (state.player.techniqueIds.includes(technique.id)) {
        const amount = duplicateCultivation(technique.tier)
        return {
          state: applyEffects(state, [{ kind: 'gainCultivation', amount }]),
          text: `功法「${technique.name}」已通，化为修为 +${amount}`,
        }
      }
      return {
        state: applyEffects(state, [
          { kind: 'learnTechnique', techniqueId: technique.id },
        ]),
        text: `功法「${technique.name}」`,
      }
    }
    case 'treasure': {
      const treasure = reward.treasureId
        ? registry.treasures.get(reward.treasureId)
        : undefined
      if (!treasure) return { state, text: '一件没有器灵的空壳' }
      if (state.player.treasureIds.includes(treasure.id)) {
        const amount = duplicateCultivation(treasure.grade + 2)
        return {
          state: applyEffects(state, [{ kind: 'gainCultivation', amount }]),
          text: `法宝「${treasure.name}」已有，化为修为 +${amount}`,
        }
      }
      return {
        state: applyEffects(state, [
          { kind: 'grantTreasure', treasureId: treasure.id },
        ]),
        text: `法宝「${treasure.name}」`,
      }
    }
    case 'mount': {
      const mount = reward.mountId ? registry.mounts.get(reward.mountId) : undefined
      if (!mount) return { state, text: '一串没有主人的旧缰' }
      if (state.player.mountIds.includes(mount.id)) {
        const amount = duplicateCultivation(3)
        return {
          state: applyEffects(state, [{ kind: 'gainCultivation', amount }]),
          text: `坐骑「${mount.name}」已在厩中，化为修为 +${amount}`,
        }
      }
      return {
        state: applyEffects(state, [{ kind: 'grantMount', mountId: mount.id }]),
        text: `坐骑「${mount.name}」`,
      }
    }
    case 'pet': {
      const pet = reward.petId ? registry.pets.get(reward.petId) : undefined
      if (!pet) return { state, text: '一团认生的小影子' }
      if (state.player.petIds.includes(pet.id)) {
        const amount = duplicateCultivation(3)
        return {
          state: applyEffects(state, [{ kind: 'gainCultivation', amount }]),
          text: `灵宠「${pet.name}」已在你身边，化为修为 +${amount}`,
        }
      }
      return {
        state: applyEffects(state, [{ kind: 'grantPet', petId: pet.id }]),
        text: `灵宠「${pet.name}」`,
      }
    }
    case 'gear': {
      const gear = grantGeneratedGear(state, rng, {
        tier: Math.max(1, Math.min(6, tier)),
        qualityBonus: reward.qualityBonus ?? 0,
        regionId,
      })
      return {
        state,
        text: `${gear.name}（${qualityTier(gear.quality).name}）`,
        gearId: gear.id,
        gearName: gear.name,
      }
    }
  }
}

/**
 * Picks a realm that fits the road and rolls its rewards.
 * Returns undefined when the region has nothing left to hide from this player.
 */
export function findSecretRealm(
  state: GameSaveData,
  options: {
    regionId: RegionId
    tierCap: number
    exclude?: ReadonlySet<string>
    rng: Rng
    registry: ContentRegistry
  },
): SecretRealmOutcome | undefined {
  const { regionId, tierCap, rng, registry } = options
  const candidates = eligibleRealms(
    state,
    registry,
    regionId,
    tierCap,
    options.exclude ?? new Set(),
  )
  if (candidates.length === 0) return undefined

  const realm = rng.pickWeighted(candidates)
  if (!realm) return undefined

  const [minPicks, maxPicks] = realm.rewardPicks
  const pickCount = Math.max(
    1,
    Math.min(
      realm.rewards.length,
      rng.nextInt(Math.max(1, minPicks), Math.max(1, maxPicks) + 1),
    ),
  )

  const pool = realm.rewards.map((reward) => ({ reward, weight: reward.weight }))
  const lines: string[] = []
  const gearIds: string[] = []
  let bestGearId: string | undefined
  let bestPower = -Infinity
  let next = state

  for (let index = 0; index < pickCount && pool.length > 0; index += 1) {
    const picked = rng.pickWeighted(pool)
    if (!picked) break
    const poolIndex = pool.findIndex((entry) => entry.reward === picked.reward)
    if (poolIndex >= 0) pool.splice(poolIndex, 1)

    const applied = applyReward(
      next,
      picked.reward,
      realm.tier,
      regionId,
      rng,
      registry,
    )
    next = applied.state
    lines.push(applied.text)
    if (applied.gearId) {
      gearIds.push(applied.gearId)
      const gear = next.player.gearInventory.find((entry) => entry.id === applied.gearId)
      if (gear && gearPower(gear) > bestPower) {
        bestPower = gearPower(gear)
        bestGearId = gear.id
      }
    }
  }

  next.rng = rng.getState()
  return {
    state: next,
    entry: {
      id: realm.id,
      name: realm.name,
      rewardText: lines.join('、') || '什么也没带走',
    },
    gearIds,
    bestGearId,
  }
}