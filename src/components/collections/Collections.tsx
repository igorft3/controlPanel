import { useEffect } from 'react';
import { observer } from 'mobx-react';
import dataStore from '../../store/indications';
import '../../assets/normalize.css';
import '../../assets/style.css';
import '../../assets/scroll.css';
import image from '../../assets/trash-icon.svg';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

function Collections() {
  useEffect(() => {
    dataStore.fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    dataStore.setPage(page);
  };

  const handleDelete = async (id: string) => {
    await dataStore.deleteData(id);
  };

  if (dataStore.loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <main className="main container">
      <h1 className="title">Список счётчиков</h1>
      <div className="table-container">
        <table className="table-wrapper">
          <thead>
            <tr>
              <th>№</th>
              <th>Тип</th>
              <th>Дата установки</th>
              <th>Автоматический</th>
              <th>Текущие показания</th>
              <th>Адрес</th>
              <th>Примечание</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <SimpleBar className="simpleBar-lib">
              {dataStore.paginatedMeters.map((meter, index) => (
                <tr key={meter.id}>
                  <td>
                    {index + 1 + (dataStore.page - 1) * dataStore.pageSize}
                  </td>
                  <td>
                    <span
                      className={
                        meter.type.includes('ХВС')
                          ? 'icon-cold'
                          : meter.type.includes('ГВС')
                          ? 'icon-hot'
                          : ''
                      }
                    ></span>
                    {meter.type}
                  </td>
                  <td>{meter.installationDate}</td>
                  <td>{meter.isAutomatic}</td>
                  <td>{meter.initialValue}</td>
                  <td>{meter.address}</td>
                  <td>{meter.description}</td>
                  <td id="delete" onClick={() => handleDelete(meter.id)}>
                    <img src={image} alt="Удалить" />
                  </td>
                </tr>
              ))}
            </SimpleBar>
            <tr className="last-row pagination-wrapper">
              <td>
                <ul className="table-list">
                  {Array.from({ length: dataStore.totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`table-item ${
                        dataStore.page === i + 1 ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default observer(Collections);
