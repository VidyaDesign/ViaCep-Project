"use client"; // Adiciona esta linha no topo do arquivo

import React, { useState, useRef, useEffect } from "react";
import { getAddress } from "../../get-address";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MdDelete } from "react-icons/md";

type Address = {
  id: string;
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  createdAt: Date;
};

const initialEnderecos: Address[] = [];

function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), {
    includeSeconds: true,
    locale: ptBR,
  });
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [enderecos, setEnderecos] = useState<Address[]>(initialEnderecos);
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Salva o array enderecos no localStorage sempre que ele for atualizado
    localStorage.setItem("enderecos", JSON.stringify(enderecos));
    // Exibe o conteúdo atualizado do localStorage no console
    console.log("Endereços salvos no localStorage:", enderecos);
  }, [enderecos]);

  function formatCep(value: string) {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) return numericValue;
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  }

  async function handleGetAddress() {
    if (inputValue.replace("-", "").length !== 8) {
      alert("CEP inválido");
      return;
    }

    setLoading(true);

    try {
      const result = await getAddress(inputValue.replace("-", ""));

      if (
        !result ||
        !result.logradouro ||
        !result.bairro ||
        !result.localidade ||
        !result.uf
      ) {
        alert("CEP inexistente!");
        setInputValue("");
        inputRef.current?.focus();
      } else {
        const newEndereco: Address = {
          id: self.crypto.randomUUID(),
          createdAt: new Date(),
          ...result,
        };
        setEnderecos([newEndereco, ...enderecos]);
        setInputValue("");
        inputRef.current?.focus();
      }
    } catch (error) {
      console.log(error);
      alert("Ocorreu um erro ao obter o endereço.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(formatCep(event.target.value));
  }

  function handleDeleteAddress(id: string) {
    const filteredAddresses = enderecos.filter(
      (endereco: Address) => endereco.id !== id
    );
    setEnderecos(filteredAddresses);
  }

  return (
    <div className='flex flex-col items-center gap-6 px-4 sm:px-8 mt-12 text-gray-800'>
      <style jsx>{`
        /* Estilo para a barra de rolagem */
        ::-webkit-scrollbar {
          width: 3px;
        }

        ::-webkit-scrollbar-track {
          background: #333; /* Fundo cinza escuro */
          border-radius: 20px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: #ccc; /* Botão cinza claro */
          border-radius: 20px;
          border: 2px solid transparent; /* Borda transparente para destacar a curva */
          background-clip: content-box;
        }
      `}</style>

      <div className='flex flex-col sm:flex-row w-full max-w-xl gap-2'>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder='Digite o CEP'
          maxLength={9}
          spellCheck={false}
          className='flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-slate-500 focus:outline-none'
        />

        <button
          disabled={inputValue === ""}
          onClick={handleGetAddress}
          className={`${
            loading ? "opacity-60 cursor-not-allowed" : ""
          } px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow-lg hover:bg-slate-500 transition-all duration-200`}
        >
          {loading ? "Carregando..." : "Obter endereço"}
        </button>
      </div>

      <div className='w-full overflow-x-auto'>
        <table className='w-full mt-4 text-left border-collapse border border-slate-500 rounded-lg shadow-lg'>
          <thead className='bg-slate-600 text-white'>
            <tr>
              <th className='p-3'>Logradouro</th>
              <th className='p-3'>Bairro</th>
              <th className='p-3'>Cidade</th>
              <th className='p-3'>Estado</th>
              <th className='p-3'>CEP</th>
              <th className='p-3'>Tempo</th>
              <th className='p-3'>Ações</th>
            </tr>
          </thead>

          <tbody>
            {enderecos.map((endereco: Address, index: number) => (
              <tr
                key={endereco.id}
                className={`${
                  index % 2 === 0 ? "bg-slate-100" : "bg-slate-300"
                } hover:bg-slate-400 transition-all duration-150`}
              >
                <td className='p-3 whitespace-nowrap'>{endereco.logradouro}</td>
                <td className='p-3 whitespace-nowrap'>{endereco.bairro}</td>
                <td className='p-3 whitespace-nowrap'>{endereco.localidade}</td>
                <td className='p-3 whitespace-nowrap'>{endereco.uf}</td>
                <td className='p-3 whitespace-nowrap'>{endereco.cep}</td>
                <td className='p-3 whitespace-nowrap'>
                  {formatDate(endereco.createdAt)}
                </td>
                <td className='p-3 text-center'>
                  <button
                    onClick={() => handleDeleteAddress(endereco.id)}
                    className='text-red-600 hover:text-red-800 transition-all duration-150'
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
