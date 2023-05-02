import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { BlobInformationRequest, LatihanExamBackEndClient } from '@/functions/swagger/LatihanExamBackEnd';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { notification } from 'antd';
import { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const FormSchema = z.object({
    name: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    }),
    address: z.string().nonempty({
        message: 'Alamat tidak boleh kosong'
    }),
});

type FormDataType = z.infer<typeof FormSchema>;

const IndexPage: Page = () => {
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset
    } = useForm<FormDataType>({
        resolver: zodResolver(FormSchema)
    });

    const [imgUrl, setImgUrl] = useState("");
    const [blobId, setBlobId] = useState("");

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
        const responseUrl = await axios.get(`/api/be/api/Blob?fileName=${fileName}`);
        setImgUrl(responseUrl.data);
        setBlobId(fileId);

    }

    async function onSubmit(data: FormDataType) {
        try {
            const client = new LatihanExamBackEndClient('http://localhost:3000/api/be');
            await client.registerCinema({
                name: data.name,
                address: data.address,
                blobId: blobId
            });
            reset();
            notification.success({
                message: 'Success',
                description: 'Successfully added cinema data',
                placement: 'bottomRight',
            });
            setImgUrl("");
            setBlobId("");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Title>Create New Cinema</Title>
            <h2 className='mb-5 text-3xl'>Create New Cinema</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input className='mt-1 px-2 py-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' id='name' {...register('name')}></input>
                    <p className='text-red-500'>{errors['name']?.message}</p>
                </div>
                <div>
                    <label htmlFor='address'>Address</label>
                    <input className='mt-1 px-2 py-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' id='address' {...register('address')}></input>
                    <p className='text-red-500'>{errors['address']?.message}</p>
                </div>
                <div>
                    <label htmlFor='profile' className="block text-sm font-medium text-gray-700">Cinema Picture</label>
                    <div className="mt-1">
                        <input id="profile" type="file" onChange={(e) => handleChange(e)}></input>
                        <img src={imgUrl?.toString()} alt=""></img>
                    </div>
                </div>
                <div className='mt-5'>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' type='submit'>
                        <FontAwesomeIcon className='mr-2' icon={faChevronUp}></FontAwesomeIcon>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}



IndexPage.layout = WithDefaultLayout;
export default IndexPage;