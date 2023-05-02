import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { GetTheaterResponse, TheaterDetails } from '@/functions/swagger/LatihanExamBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState } from 'react';
import useSwr from 'swr';
import { Alert } from 'antd';

const CinemaTableRow: React.FC<{
    theaters: TheaterDetails
}> = ({ theaters }) => {
    return (
        <tr>
            <td className="border px-4 py-2">{theaters.id}</td>
            <td className="border px-4 py-2">{theaters.name}</td>
            <td className="border px-4 py-2">{theaters.cinemaName}</td>
            <td className="border px-4 py-2">{theaters.theaterType}</td>
            <td className="border px-4 py-2">
                <Link href={`/theater/edit/${theaters.id}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faEdit}></FontAwesomeIcon>
                    Edit
                </Link>
            </td>
        </tr>
    );
}

const IndexPage: Page = () => {
    const [url, setUrl] = useState(`api/Theater/get-theater-list?limit=3`);
    const swrFetcher = useSwrFetcherWithAccessToken();
    const { data, error } = useSwr<GetTheaterResponse>(`/api/be/${url}`, swrFetcher);


    return (
        <div>
            <Title>Manage Theater</Title>
            <h2 className='mb-5 text-3xl'>Manage Theater</h2>
            <div>
                <Link href='/theater/createTheater' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block'>
                    <FontAwesomeIcon icon={faPlus} className='mr-2'></FontAwesomeIcon>
                    Create New theater
                </Link>
            </div>
            <Title>Manage User</Title>
            {Boolean(error) && <Alert type='error' message='Cannot get user data' description={String(error)}></Alert>}
            <table className='table-auto mt-5'>
                <thead className='bg-slate-700 text-white'>
                    <tr>
                        <th className='px-4 py-2'>Id</th>
                        <th className='px-4 py-2'>Name</th>
                        <th className='px-4 py-2'>Cinema</th>
                        <th className='px-4 py-2'>Theater</th>
                        <th className='px-4 py-2'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.theaters?.map((x, i) => <CinemaTableRow key={i} theaters={x}></CinemaTableRow>)}
                </tbody>
            </table>
            <div className="space-y-8 space-x-40">
                <button onClick={() => setUrl(data?.prevCursor != null ? data?.prevCursor : "")} className="bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" type="button">
                    Previous
                </button>
                <button onClick={() => setUrl(data?.nextCursor != null ? data?.nextCursor : "")} className="bg-blue-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" type="button">
                    Next
                </button>
            </div>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;