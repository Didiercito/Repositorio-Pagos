import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class KitchenServiceAdapter {
  private kitchenUrl: string;

  constructor() {
    this.kitchenUrl = process.env.KITCHEN_SERVICE_URL || '';
  }

  async getMyKitchenId(token: string): Promise<string | null> {
    try {
      const cleanToken = token.replace('Bearer ', '');

      const response = await axios.get(`${this.kitchenUrl}/kitchens/me`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`
        }
      });

      if (response.data && response.data.success && response.data.data) {
        return response.data.data.id.toString();
      }

      return null;

    } catch (error) {
      console.error('❌ Error consultando Kitchen Service:', error);
      return null;
    }
  }
}