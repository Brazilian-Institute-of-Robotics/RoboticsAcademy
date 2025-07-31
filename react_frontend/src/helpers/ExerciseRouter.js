import { getCookie } from "./cookie"

const ExerciseRouter = {
  create: async (exerciseName, description, universeName, worldFile, halCode, serverBase) => {
      try{
        const csrfToken = getCookie("csrftoken")

        const formData = new FormData()
        formData.append('exerciseName', exerciseName.trim())
        formData.append('description', description)
        formData.append('universe_name', universeName.trim())
        formData.append('worldFile', worldFile)
        formData.append('halCode', halCode)

        const res = await fetch(`${serverBase}/api/v1/exercise/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken
          },
          body: formData,
        });
    
        const data = await res.json();
        if (res.ok) 
          return {"success": 1, "data":data}
        else 
          return {"success": 0, "error":data.error}

      } catch(error){
        //console.log(error)
        return {"success": 0, "error":"Error on create new exercise (FRONT END). please contact suport"}
      }

  },
  findByName: async (name, serverBase) => {
      try {
          const csrfToken = getCookie("csrftoken")
          const res = await fetch(`${serverBase}/api/v1/exercise/findByName/${encodeURIComponent(name)}/`, {
            method: 'GET',
            headers: {
              'X-CSRFToken': csrfToken
            },
          });
    
          const data = await res.json();
    
          if (res.ok){
              return {"success": 1, "data":data}
          }else
            return {"success": 0, "error":data.error}
        } catch (error) {
          console.log(error)
          return {"success": 0, "error":"Error on check exercise name (FRONT END). please contact suport"}
        }
  }
}

export default ExerciseRouter