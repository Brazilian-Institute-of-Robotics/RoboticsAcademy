// CreateExerciseForm.jsx
import React, { useState } from 'react';
import Editor from "@monaco-editor/react";

function CreateExerciseForm() {
  const [worldFile, setWorldFile] = useState(null);
  const [name, setName] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false)

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedNodes, setSelectedNodes] = useState([]);

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
  const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

  const availableNodes = [
    "bumper", "camera", "laser", "motors",
    "neural_network", "noisy_odometry", "odometry", "sim_time"
  ];

  const toggleNode = (node) => {
    setSelectedNodes((prev) =>
      prev.includes(node) ? prev.filter((n) => n !== node) : [...prev, node]
    );
  };

  function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            for (let cookie of document.cookie.split(';')) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.name.endsWith('.world')) {
      setWorldFile(selectedFile);
      setError("");
    } else {
      setWorldFile(null);
      setError("Apenas arquivos .world são permitidos.");
    }
  };

  const handleDelete = async (e) => {
    if (!name) {
      setResponseMsg('Digite um nome de exercício para deletar');
      return;
    }
    setIsDeleting(true)

    const csrfToken = getCookie("csrftoken")
    const res = await fetch(`${serverBase}/api/v1/exercise/${encodeURIComponent(name)}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrfToken
      },
    });

    const data = await res.json();

    if (res.ok) {
      setResponseMsg(`✅ ${data.message}`);
      setName('');
    } else {
      setResponseMsg(`❌ ${data.error}`);
    }

    setIsDeleting(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');

    const csrfToken = getCookie("csrftoken")

    if (!worldFile) {
      setResponseMsg("❌ Nenhum arquivo selecionado.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('hal_code', code)
    formData.append('world_file', worldFile);

    const res = await fetch(`${serverBase}/api/v1/exercise/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setResponseMsg(`✅ ${data.message}`);
      setName('');
      setWorldFile(null)
    } else {
      setResponseMsg(`❌ ${data.error}`);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const csrfToken = getCookie("csrftoken")

    const res = await fetch(`${serverBase}/api/v1/hal/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ nodes: selectedNodes}),
    });

    const data = await res.json();
    if (res.ok) {
      setCode(data.code)
    } else {
      setCode("ERROR AO BUSCAR O CODIGO");
    }
    
    setLoading(false);
    
  };

  return (
    <div>
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Criar novo exercício</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            placeholder="Nome do exercício"
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <br/>
          <br/>

          <h4 className="text-xl font-bold mb-4">Inserir arquivo world</h4>

          <input
            type="file"
            accept=".world"
            onChange={handleFileChange}
            className="mb-2"
          />

          <br/>
          <br/>
          
          <h4 className="text-xl font-bold mb-4">Selecione nós necessários que serão usados</h4>

          <div className="mb-4 flex flex-wrap gap-4">
            {availableNodes.map((node) => (
              <div>
                <label key={node} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedNodes.includes(node)}
                    onChange={() => toggleNode(node)}
                    className="accent-blue-600"
                  />
                  {node}
                </label>
                <br/>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Gerar HAL.py
          </button>

          <Editor
            height="600px"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
            }}
          />

          <br/>

          <div className="flex gap-2">
            <button
              type="submit"
              
            >
              Criar
            </button>
            <br/>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              
            >
              Deletar
            </button>
          </div>
        </form>
        {responseMsg && <p className="mt-4">{responseMsg}</p>}
        <br/>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Editor HAL com Monaco</h1>

      </div>
  </div>
  );
}

export default CreateExerciseForm;
