// CreateExerciseForm.jsx
import React, { useState } from 'react';

function CreateExerciseForm() {
  const [name, setName] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false)

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
  const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

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

    const res = await fetch(`${serverBase}/api/v1/exercise/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setResponseMsg(`✅ ${data.message}`);
      setName('');
    } else {
      setResponseMsg(`❌ ${data.error}`);
    }
  };

  return (
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
    </div>
  );
}

export default CreateExerciseForm;
