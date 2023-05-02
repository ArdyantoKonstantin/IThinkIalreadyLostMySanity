import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { CinemaDetails, GetCinemaResponse } from '@/functions/swagger/LatihanExamBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState } from 'react';
import useSwr from 'swr';
import { Alert } from 'antd';

const CinemaTableRow: React.FC<{
    cinema: CinemaDetails
}> = ({ cinema }) => {
    return (
        <tr>
            <td className="border px-4 py-2">{cinema.id}</td>
            <td className="border px-4 py-2">{cinema.name}</td>
            <td className="px-6 py-4 whitespace-nowrap border">
                <img className="h-96 w-96 rounded-full" src={`/api/be/api/Blob/redirect?fileName=${cinema.fileUrl}`} alt="Profile" />
            </td>
            <td className="border px-4 py-2">
                <Link href={`/cinema/edit/${cinema.id}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faEdit}></FontAwesomeIcon>
                    Edit
                </Link>
            </td>
        </tr>
    );
}

const IndexPage: Page = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const swrFetcher = useSwrFetcherWithAccessToken();
    const { data, error } = useSwr<GetCinemaResponse>(`/api/be/api/Cinema/cinema-list?limit=3&offset=${pageIndex}`, swrFetcher);

    const handleNextClick = () => {
        setPageIndex(pageIndex + 1);
    };

    const handlePrevClick = () => {
        setPageIndex(pageIndex - 1);
    };

    return (
        <div>
            <Title>Manage Cinema</Title>
            <h2 className='mb-5 text-3xl'>Manage Cinema</h2>
            <div>
                <Link href='/cinema/createUser' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block'>
                    <FontAwesomeIcon icon={faPlus} className='mr-2'></FontAwesomeIcon>
                    Create New Cinema
                </Link>
            </div>
            <Title>Manage User</Title>
            {Boolean(error) && <Alert type='error' message='Cannot get user data' description={String(error)}></Alert>}
            <table className='table-auto mt-5'>
                <thead className='bg-slate-700 text-white'>
                    <tr>
                        <th className='px-4 py-2'>Id</th>
                        <th className='px-4 py-2'>Username</th>
                        <th className='px-4 py-2'>Picture</th>
                        <th className='px-4 py-2'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.cinemas?.map((x, i) => <CinemaTableRow key={i} cinema={x}></CinemaTableRow>)}
                </tbody>
            </table>
            <div className="space-y-8 space-x-40">
                <button onClick={handlePrevClick} className="bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" type="button">
                    Previous
                </button>
                <button onClick={handleNextClick} className="bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" type="button">
                    Next
                </button>
            </div>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;