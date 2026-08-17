/**
 * IPFS Integration Client — Content-addressed storage adapter
 *
 * Provides upload, download, and pinning capabilities for IPFS.
 * Uses Cloudflare Web3 gateway for HTTP access.
 */

export interface IPFSClient {
  upload(data: string | Buffer): Promise<string>;
  download(cid: string): Promise<Buffer>;
  pin(cid: string): Promise<void>;
}

export class IPFSAdapter implements IPFSClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://ipfs.io/api/v0') {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload data to IPFS and return the CID.
   */
  async upload(data: string | Buffer): Promise<string> {
    const formData = new FormData();
    formData.append('file', new Blob([data]));

    const response = await fetch(`${this.baseUrl}/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.Hash;
  }

  /**
   * Download data from IPFS by CID.
   */
  async download(cid: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/cat?arg=${cid}`);

    if (!response.ok) {
      throw new Error(`IPFS download failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Pin a CID to ensure persistence.
   */
  async pin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/pin/add?arg=${cid}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`IPFS pin failed: ${response.status}`);
    }
  }

  /**
   * Get the HTTP gateway URL for a CID.
   */
  getGatewayUrl(cid: string, gateway: string = 'https://cloudflare-ipfs.com'): string {
    return `${gateway}/ipfs/${cid}`;
  }
}

// ─── Convenience Functions ──────────────────────────────────────

export async function uploadToIPFS(
  data: string,
  baseUrl?: string,
): Promise<string> {
  const client = new IPFSAdapter(baseUrl);
  return client.upload(data);
}

export async function downloadFromIPFS(
  cid: string,
  baseUrl?: string,
): Promise<Buffer> {
  const client = new IPFSAdapter(baseUrl);
  return client.download(cid);
}

export async function pinIPFS(
  cid: string,
  baseUrl?: string,
): Promise<void> {
  const client = new IPFSAdapter(baseUrl);
  return client.pin(cid);
}
