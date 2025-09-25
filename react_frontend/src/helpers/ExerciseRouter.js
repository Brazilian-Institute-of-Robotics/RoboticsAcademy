import { getCookie } from "./cookie"

const ExerciseRouter = {
  create: async (
    exerciseName, description, universeName, 
    worldFile, halCode, categoryId, teaserImageFile, 
    guidePageFiles, guidePageCode, serverBase) => {

    try{
      const csrfToken = getCookie("csrftoken")

      const formData = new FormData()
      formData.append('exerciseName', exerciseName.trim())
      formData.append('description', description)
      formData.append('universe_name', universeName.trim())
      formData.append('worldFile', worldFile)
      formData.append('halCode', halCode)
      formData.append('category_id', categoryId)
      formData.append('teaser_image_file', teaserImageFile)
      formData.append('guide_page_code', guidePageCode)

      guidePageFiles.forEach(file => {
        formData.append('guide_page_files', file);
      });

      const res = await fetch(`${serverBase}/api/v1/exercise/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken
        },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok){

        // TO GIVE TIME (30s) TO FRONTEND BE REBUILD WITH NEW PAGE OF EXERCISE
        await new Promise(resolve => setTimeout(resolve, 30000));

        return {"success": 1, "data":data}
      }
      else 
        return {"success": 0, "error":data.error}

    } catch(error){
      //console.log(error)
      return {"success": 0, "error":"Error on create new exercise. Check connection or contact suport"}
    }

  },

  checkNameAvalability: async (name, serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exercise/checkNameAvailability/${encodeURIComponent(name)}/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok)
        return {"success": 1, "data":data}
      else
        return {"success": 0, "error":data.error}
    } catch (error) {
      //console.log(error)
      return {"success": 0, "error":"Error on check exercise name. Check connection or contact suport"}
    }
  },

  getExerciseList: async (serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exerciseList/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok)
        return {"success": 1, "data":data}
      else
        return {"success": 0, "error":data.error}
    } catch (error) {
      //console.log(error)
      return {"success": 0, "error":"Error on find exercise's list. Check connection or contact suport"}
    }
  },

  delete: async (id, serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exercise/${encodeURIComponent(id)}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok){
        // TO GIVE TIME (30s) TO FRONTEND BE REBUILDED
        await new Promise(resolve => setTimeout(resolve, 30000));
        return {"success": 1, "data":data}
      }
      else
        return {"success": 0, "error":data.error}
    } catch (error) {
      //console.log(error)
      return {"success": 0, "error":"Error on find exercise's list. Check connection or contact suport"}
    }
  },

  changeStatus: async (id, serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exercise/changeStatus/${encodeURIComponent(id)}/`, {
        method: 'PATCH',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok)
        return {"success": 1, "newStatus":data.newStatus}
      else
        return {"success": 0, "error":data.error}
    } catch (error) {
      //console.log(error)
      return {"success": 0, "error":"Error on change exercise. Check connection or contact suport"}
    }
  },

  getExerciseToUpdate: async (id, serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exercise/${encodeURIComponent(id)}/getDataToUpdate/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok)
        return {"success": 1, "data":data}
      else
        return {"success": 0, "error":data.error}
    } catch (error) {
      //console.log(error)
      return {"success": 0, "error":"Error on find exercise. Check connection or contact suport"}
    }
  }
}

export default ExerciseRouter