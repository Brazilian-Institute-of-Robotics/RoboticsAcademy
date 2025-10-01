import { getCookie } from "./cookie"

const UniverseRouter = {
  checkNameAvalability: async (name, serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/universe/checkNameAvailability/${encodeURIComponent(name)}/`, {
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
      return {"success": 0, "error":"Error on check universe name. Check connection or contact suport"}
    }
  },
  getUniverseList: async (serverBase) => {
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/universeList/`, {
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
      return {"success": 0, "error":"Error on find universe's list. Check connection or contact suport"}
    }
  },
}

export default UniverseRouter