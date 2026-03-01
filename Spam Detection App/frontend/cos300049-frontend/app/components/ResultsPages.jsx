"use client"
import {useEffect, useState} from "react";


export default function ResultsPages(props){
    const [pageNumber, setPageNumber] = useState(0);
    const [data, setData] = useState(null);
    const changePage = (changeBy) => {
        let newNumber = changeBy + pageNumber;

        if (newNumber < 0){
            return;
        }
        setPageNumber(newNumber);
    }
    const getPages = async () => {
        try{
            const res = await fetch("http://127.0.0.1:8000/api/getpage?page_number=" + pageNumber,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })
            const data = await res.json();
            setData(data);
        }catch(err){
            console.log(err);
        }
    }
    const viewResult = async(resultNumber) =>{
        try{
            const res = await fetch("http://127.0.0.1:8000/api/getresult?result_id=" + resultNumber,{
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            props.setData(data);
            props.setState(4);
        }catch(err){
            console.log(err);

        }
    }
    useEffect(() => {
        getPages();
    }, [pageNumber]);
    return(
        <div>
            <div className="min-w-full min-h-1/6 rounded-lg mb-2 flex flex-row mt-1 space-x-1">
                <button className="grow mr-8 ml-4 text-center" onClick={()=> props.setState(0)}>
                    Back to Main Menu
                </button>

                <button onClick={()=> changePage(-1)}>
                    Previous Page
                </button>
                <button className="hover:animate-none scale-100 pointer-events-none">
                    {pageNumber + 1}
                </button>
                <button onClick={()=> changePage(1)}>
                    Next Page
                </button>
            </div>
            <table className="min-w-full mx-auto px-2 divide-y divide-gray-700 bg-gray-900 text-white rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider">Saved At</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider">Spam Chance</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                {data && data.map((item, index) => (
                    <tr key={item.id} onClick={() => viewResult(item.id)} className={`transition-all hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} hover:cursor-pointer`}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{item.saved_at}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">{Math.round(item.spam_chance * 100)}%</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}