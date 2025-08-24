const { create } = require('ipfs-http-client');
const fs = require('fs').promises;

class IPFSManager {
  constructor(config) {
    this.client = create({
      host: config.host || 'localhost',
      port: config.port || 5001,
      protocol: config.protocol || 'http'
    });
  }

  /**
   * Upload data to IPFS
   * @param {Object|string} data - Data to upload
   * @returns {string} IPFS hash
   */
  async uploadData(data) {
    try {
      const content = typeof data === 'object' ? JSON.stringify(data) : data;
      const result = await this.client.add(content);
      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload file to IPFS
   * @param {string} filePath - Path to file
   * @returns {string} IPFS hash
   */
  async uploadFile(filePath) {
    try {
      const file = await fs.readFile(filePath);
      const result = await this.client.add(file);
      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Retrieve data from IPFS
   * @param {string} hash - IPFS hash
   * @returns {Object|string} Retrieved data
   */
  async getData(hash) {
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString();
      
      // Try to parse as JSON
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
  }

  /**
   * Pin content to ensure persistence
   * @param {string} hash - IPFS hash
   * @returns {Object} Pin result
   */
  async pin(hash) {
    try {
      const result = await this.client.pin.add(hash);
      return result;
    } catch (error) {
      throw new Error(`Failed to pin content: ${error.message}`);
    }
  }

  /**
   * Unpin content
   * @param {string} hash - IPFS hash
   * @returns {Object} Unpin result
   */
  async unpin(hash) {
    try {
      const result = await this.client.pin.rm(hash);
      return result;
    } catch (error) {
      throw new Error(`Failed to unpin content: ${error.message}`);
    }
  }

  /**
   * List pinned content
   * @returns {Array} List of pinned hashes
   */
  async listPinned() {
    try {
      const pins = [];
      for await (const pin of this.client.pin.ls()) {
        pins.push({
          cid: pin.cid.toString(),
          type: pin.type
        });
      }
      return pins;
    } catch (error) {
      throw new Error(`Failed to list pinned content: ${error.message}`);
    }
  }

  /**
   * Check if IPFS node is online
   * @returns {boolean} Connection status
   */
  async isOnline() {
    try {
      const id = await this.client.id();
      return !!id;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get IPFS node information
   * @returns {Object} Node information
   */
  async getNodeInfo() {
    try {
      const info = await this.client.id();
      return {
        id: info.id,
        version: info.agentVersion,
        addresses: info.addresses
      };
    } catch (error) {
      throw new Error(`Failed to get node info: ${error.message}`);
    }
  }

  /**
   * Upload multiple files as directory
   * @param {Array} files - Array of {path, content} objects
   * @returns {string} Directory IPFS hash
   */
  async uploadDirectory(files) {
    try {
      const results = [];
      
      for await (const result of this.client.addAll(files)) {
        results.push(result);
      }
      
      // Return the root directory hash
      return results[results.length - 1].path;
    } catch (error) {
      throw new Error(`Failed to upload directory: ${error.message}`);
    }
  }

  /**
   * Calculate size of stored content
   * @param {string} hash - IPFS hash
   * @returns {number} Size in bytes
   */
  async getSize(hash) {
    try {
      const stats = await this.client.object.stat(hash);
      return stats.CumulativeSize;
    } catch (error) {
      throw new Error(`Failed to get size: ${error.message}`);
    }
  }
}

module.exports = IPFSManager;