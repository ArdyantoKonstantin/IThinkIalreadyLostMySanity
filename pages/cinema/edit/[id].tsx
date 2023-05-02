import Link from 'next/link';
import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useRouter } from 'next/router';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spin, notification } from 'antd';
import { BlobInformationRequest, GetSpecificCinemaResponse, LatihanExamBackEndClient } from '@/functions/swagger/LatihanExamBackEnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ChangeEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const FormSchema = z.object({
    address: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    }),
});

type FormDataType = z.infer<typeof FormSchema>;

const EditForm: React.FC<{
    id: string,
    address: string,
    blobName: string | undefined,
    onEdit: () => void
}> = ({ id, address, blobName, onEdit }) => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset
    } = useForm<FormDataType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            address: address
        }
    });

    const [imgUrl, setImgUrl] = useState(blobName);
    const [blobId, setBlobId] = useState("");

    async function onSubmit(data: FormDataType) {
        try {
            const client = new LatihanExamBackEndClient('http://localhost:3000/api/be');
            await client.updateCinema(id, data.address, blobId);
            reset(data);
            onEdit();
            notification.success({
                message: 'Success',
                description: 'Successfully edited Cinema data',
                placement: 'bottomRight',
            });

        } catch (error) {
            console.error(error);
        }
    }

    async function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) {
            console.log('error: file null');
            return;
        }

        const fileName = files[0]?.name;
        const filetype = files[0]?.type;
        const fileId = uuidv4();
        const requestModel : BlobInformationRequest = {id : fileId, fileName: fileName, mime: filetype};
        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.get<string>(`/api/be/api/Blob/presigned-put-object?fileName=${fileName}`);
        axios.put(response.data, files[0]);
        axios.post(`/api/be/api/Blob/blob-information`, requestModel, {headers});
        setImgUrl(fileName);
        setBlobId(fileId);

    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            
            <div>
                <label htmlFor='Address'>Address</label>
                <input className='mt-1 px-2 py-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' id='Address' {...register('address')}></input>
                <p className='text-red-500'>{errors['address']?.message}</p>
            </div>
            <div>
                <label htmlFor='profile' className="block text-sm font-medium text-gray-700">Cinema Picture</label>
                <div className="mt-1">
                    <input id="profile" type="file" onChange={(e) => handleChange(e)}></input>
                    <img className="h-96 w-96 rounded-full" src={`/api/be/api/Blob/redirect?fileName=${imgUrl?.toString()}`} alt="Profile" />
                </div>
            </div>
            <div className='mt-5'>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' type='submit'>
                    <FontAwesomeIcon className='mr-2' icon={faChevronUp}></FontAwesomeIcon>
                    Submit
                </button>
            </div>
        </form>
    );
}

const IndexPage: Page = () => {
    const router = useRouter();
    const { id } = router.query;
    const fetcher = useSwrFetcherWithAccessToken();
    const cinemaDetailUri = id ? `/api/be/api/Cinema/cinema-detail?id=${id}` : undefined;
    const { data, mutate } = useSwr<GetSpecificCinemaResponse>(cinemaDetailUri, fetcher);

    function renderForm() {
        if (!id) {
            return (
                <Spin tip="Loading..." size='large'></Spin>
            );
        }

        if (typeof id !== 'string') {
            return (
                <Spin tip="Loading..." size='large'></Spin>
            );
        }

        const address = data?.address;
        if (!address) {
            return (
                <Spin tip="Loading..." size='large'></Spin>
            );
        }

        const blobName = data?.blobName;
        if (!blobName) {
            return (
                <Spin tip="Loading..." size='large'></Spin>
            );
        }

        return (
            <EditForm blobName={blobName} id={id} address={address} onEdit={() => mutate()}></EditForm>
        );
    }

    return (
        <div>
            <Title>Edit Brand Data</Title>
            <Link href='/cinema'>Return to Index</Link>

            <h2 className='mb-5 text-3xl'>Edit Brand Data</h2>
            {renderForm()}
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;