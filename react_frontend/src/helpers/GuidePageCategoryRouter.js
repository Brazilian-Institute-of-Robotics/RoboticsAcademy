import { getCookie } from "./cookie"

const GuidePageCategoryRouter = {
    findAll: async(serverBase) => {
        try {
            const csrfToken = getCookie("csrftoken")
            const res = await fetch(`${serverBase}/api/v1/guideCategory/findAll`, {
                method: 'GET',
                headers: {'X-CSRFToken': csrfToken},
            });
      
            const data = await res.json();
      
            if (res.ok)
              return {"success": 1, "data":data}
            else
              return {"success": 0, "error":data.error}
          } catch (error) {
            //console.log(error)
            return {"success": 0, "error":"Error to find list of guide category. Check connection or contact suport"}
          }
    }
}

export default GuidePageCategoryRouter