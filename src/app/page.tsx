'use client'
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import countriesData from '../../public/countries.json';

interface DataItem {
  id: number;
  country: string;
  region: string;
  city: string;
  iso: string;
  text: string;
}

function DataList({
  data,
  selectedIds,
  onSelect,
  onDeleteSelected,
}: {
  data: DataItem[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onDeleteSelected: () => void;
}) {
  return (
    <div className='main__item'>
      <ul >
        {data
          .slice() // Crear una copia del arreglo para no modificar el original
          .sort((a, b) => a.country.localeCompare(b.country)) 
        .map((item) => (
          <div className='item'>
            <li key={item.id}>

              {/* <strong>ISO:</strong> {item.iso} */}
              <img src={`/flags/${item.iso}.png`}></img>
              <br />
              <strong>País:</strong>{item.country}
              <br />
              <strong>Provincia/región</strong> {item.region}
              <br />
              <strong>Ciudad/pueblo</strong> {item.city}
              <br />
              <strong>Descripción:</strong> {item.text}
            </li>
 
             <input
                id='checkbox'
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onSelect(item.id)}
              />

            <button onClick={onDeleteSelected}>Delete</button>
          </div>

        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    city: '',
    iso: '',
    text: '',
  });
  const [data, setData] = useState<DataItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(''); // Estado para almacenar el país seleccionado

  const selectedCountryData = countriesData.find((country) => country.alpha2 === selectedCountry);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateTable = async () => {
    try {
      const response = await fetch('https://travel-page-backend-git-main-criaturaimaginaria.vercel.app/api/crearNuevaTabla', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('La solicitud no se pudo completar.');
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error al crear la tabla:', error);
    }
  };

  const handleInsertData = async () => {
    try {
      const response = await fetch('https://travel-page-backend-git-main-criaturaimaginaria.vercel.app/api/insertarDatos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('La solicitud no se pudo completar.');
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error al insertar datos:', error);
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      // Desseleccionar el elemento
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      // Seleccionar el elemento
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Enviar una solicitud para eliminar los elementos seleccionados por ID
      await Promise.all(
        selectedIds.map(async (id) => {
          const response = await fetch(`https://travel-page-backend-git-main-criaturaimaginaria.vercel.app/api/eliminarDato/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(`Error al eliminar elemento con ID ${id}`);
          }
        })
      );

      // Actualizar la lista de elementos después de la eliminación
      const updatedData = data.filter((item) => !selectedIds.includes(item.id));
      setData(updatedData);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error al eliminar elementos seleccionados:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://travel-page-backend-git-main-criaturaimaginaria.vercel.app/api/obtenerDatos');
        if (!response.ok) {
          throw new Error('La solicitud no se pudo completar.');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="main__layout">
      <h1>Travel Page :D</h1>
      <div className='main__container'>
        {/* <h2>Datos del servidor:</h2> */}
        {/* <button onClick={handleCreateTable}>Crear Tabla</button> */}

        <div className='main__itemcontainer'>
          <h2>Lugares a visitar</h2>
          <DataList
            data={data}
            selectedIds={selectedIds}
            onSelect={handleSelectItem}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>

        <h2>Crear nuevo destino :D</h2>
        <div className='main__createContainer'>
          <div className='main__createContainer__box1'>
            <select
              className='create__select'
              name="iso"
              value={selectedCountry} // Usa el estado para el valor seleccionado
              // onChange={(e) => {
              //   setSelectedCountry(e.target.value);
              //   // Actualiza el formData con el valor seleccionado (alpha2)
              //   console.log(e.target.textContent, "tarjet")
              //   setFormData({
              //     ...formData,
              //     iso: e.target.value,
              //   });
              // }}
              onChange={(e) => {
                const selectedAlpha2 = e.target.value;
                setSelectedCountry(selectedAlpha2);
              
                // Busca el país correspondiente en el JSON de países
                const selectedCountryData = countriesData.find((country) => country.alpha2 === selectedAlpha2);
              
                if (selectedCountryData) {
                  setFormData({
                    ...formData,
                    country: selectedCountryData.name, // Actualiza el campo "country" con el nombre del país
                    iso: selectedAlpha2, // Actualiza el campo "iso" con el código alpha2
                  });
                }
              }}
              

            >
              <option value="">País</option>
              {countriesData.map((country) => (
                <option key={country.alpha2} value={country.alpha2}>
                  {country.name}
                </option>
              ))}
            </select>


            {/* <input
              type="text"
              name="country"
              placeholder="País"
              value={selectedCountryData ? selectedCountryData.name : ""}
              onChange={handleInputChange}
            /> */}
            <input
              className='create__input'
              type="text"
              name="region"
              placeholder="Región/provincia"
              value={formData.region}
              onChange={handleInputChange}
            />
            <input
              className='create__input'
              type="text"
              name="city"
              placeholder="Ciudad/pueblo"
              value={formData.city}
              onChange={handleInputChange}
            />
            {/* <input
              type="text"
              name="iso"
              placeholder="ISO"
              value={formData.iso}
              onChange={handleInputChange}
            /> */}


              

            <textarea
            className='create__textarea'
              name="text"
              placeholder="Descripción"
              value={formData.text}
              onChange={handleInputChange}
            />

              <button onClick={handleInsertData}>Insertar Datos</button>
              <div>{message}</div>

          </div>



            <div className='main__createContainer__box2'>
                {selectedCountryData && (
                  <div>
                    <img src={`/flags/${selectedCountry}.png`}></img>  
                    {/* <p>País: {selectedCountryData.name}</p> */}
                    {/* <p>Código alpha2: {selectedCountryData.alpha2}</p> */}
                  </div>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
