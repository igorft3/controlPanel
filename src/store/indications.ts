import { makeAutoObservable } from 'mobx';
import axios from 'axios';

interface IData {
  id: string;
  type: string;
  installationDate: string;
  isAutomatic: boolean | null;
  initialValue: number;
  address: string;
  description: string;
}

class DataStore {
  meters: IData[] = [];
  areas: Record<string, string> = {};
  loading: boolean = false;
  page: number = 1;
  pageSize: number = 20;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchData() {
    this.loading = true;
    try {
      const meterResponse = await axios.get(
        'http://showroom.eis24.me/api/v4/test/meters/'
      );
      const areaResponse = await axios.get(
        ' http://showroom.eis24.me/api/v4/test/areas/'
      );

      const areas = areaResponse.data.results.reduce(
        (
          acc: Record<string, string>,
          area: { id: string; house: { address: string } }
        ) => {
          acc[area.id] = area.house.address;
          return acc;
        },
        {}
      );

      this.meters = meterResponse.data.results.map((meter: any) => ({
        id: meter.id,
        type: meter._type.includes('ColdWaterAreaMeter')
          ? 'ХВС'
          : meter._type.includes('HotWaterAreaMeter')
          ? 'ГВС'
          : 'Неизвестно',
        installationDate: new Date(meter.installation_date).toLocaleDateString(
          'ru-RU'
        ),
        isAutomatic:
          meter.is_automatic === true
            ? 'да'
            : meter.is_automatic === false
            ? 'нет'
            : 'Нет данных',
        initialValue: meter.initial_values[0],
        address: areas[meter.area.id] || 'Неизвестно',
        description: meter.description,
      }));
    } catch (err) {
      console.warn('Ошибка получения информации', err);
    } finally {
      this.loading = false;
    }
  }

  async deleteData(id: string) {
    try {
      await axios.delete(`http://showroom.eis24.me/api/v4/test/meters/${id}/`);
      this.meters = this.meters.filter((meter) => meter.id !== id);
      if (this.meters.length < this.pageSize * this.page) {
        await this.fetchData();
      }
    } catch (err) {
      console.warn('Ошибка получения информации', err);
    }
  }

  get paginatedMeters() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.meters.slice(start, end);
  }

  setPage(page: number) {
    this.page = page;
  }

  get totalPages() {
    return Math.ceil(this.meters.length / this.pageSize);
  }
}

const dataStore = new DataStore();
export default dataStore;
