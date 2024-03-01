import { useState, useEffect } from 'react'

const useFetchData = (path) => {
  const [dataFetched, setData] = useState({})
  const [isDataLoading, setDataLoading] = useState(false)
  const [isError, setError] = useState()
  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setDataLoading(true)
        try {
            let response
            response = await fetch(path)
            // define an error status
            if (!response.ok) {
                setErrorStatus(response.status)
                throw new Error(response.status)
            }
            const data = await response.json()
            setData(data)
            setError(null)
            setDataLoading(false)
        } catch (error) {
            setError(true)
            setDataLoading(false)
            if (errorStatus != null) {
                console.log(errorStatus)
            }
        }
    }
    fetchData()
  }, [errorStatus, path])

  return { dataFetched, isDataLoading, isError }
}


export const GetData = (path) => {
    return useFetchData(path)
}