/**
 * Word-pack catalog: free built-ins + future Play IAP packs.
 * Purchasable packs are stubs until product ids are live in Play Console.
 */

export type PackAccess = 'free' | 'premium' | 'iap'

export type CatalogPack = {
  id: string
  title: string
  description: string
  access: PackAccess
  /** Play Billing product id when access === 'iap' */
  productId?: string
  /** Not playable yet — shown as Coming soon */
  comingSoon?: boolean
}

export const PACK_CATALOG: CatalogPack[] = [
  {
    id: 'classic',
    title: 'Classic',
    description: 'General vocabulary by difficulty (Easy / Normal / Hard).',
    access: 'free',
  },
  {
    id: 'expat',
    title: 'Expat DE',
    description: 'Germany / expat life by categories.',
    access: 'free',
  },
  {
    id: 'custom',
    title: 'My packs',
    description: 'Create your own word lists. Requires no-ads subscription.',
    access: 'premium',
  },
  {
    id: 'seasonal',
    title: 'Seasonal',
    description: 'Limited themed packs — coming via Play purchase.',
    access: 'iap',
    productId: 'alias_pack_seasonal',
    comingSoon: true,
  },
]
