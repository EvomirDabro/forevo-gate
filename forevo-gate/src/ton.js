import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const BASE = process.env.TONAPI_BASE || 'https://tonapi.io'
const KEY = process.env.TONAPI_KEY || ''
const COLLECTION = (process.env.COLLECTION_ADDRESS || '').trim()

export async function getAccountNfts(ownerAddress) {
  if (!ownerAddress) return []
  const url = `${BASE}/v2/accounts/${ownerAddress}/nfts`
  const headers = KEY ? { Authorization: `Bearer ${KEY}` } : {}
  const { data } = await axios.get(url, { headers })
  return data?.nft_items || data?.nftItems || []
}

export async function hasNft(ownerAddress) {
  if (!COLLECTION) throw new Error('COLLECTION_ADDRESS не задан в .env')
  const items = await getAccountNfts(ownerAddress)
  return items.some((it) => {
    const col = it?.collection || it?.collection_address || it?.collectionAddress
    const addr = typeof col === 'string' ? col : col?.address
    return addr && addr.toLowerCase() === COLLECTION.toLowerCase()
  })
}
