import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { z } from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import {GetCinemaNormalResponse, GetTheaterTypeResponse, LatihanExamBackEndClient } from '@/functions/swagger/LatihanExamBackEnd';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { notification } from 'antd';
import { useState } from 'react';
import useSwr from 'swr';
import { Select, Spin } from 'antd';
import debounce from 'lodash.debounce';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';

const FormSchema = z.object({
    name: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    }),
    cinemaId: z.string().nonempty({
        message: 'Cinema tidak boleh kosong'
    }),
    typeId: z.string().nonempty({
        message: 'type tidak boleh kosong'
    })
});

type FormDataType = z.infer<typeof FormSchema>;

const IndexPage: Page = () => {
    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
        control
    } = useForm<FormDataType>({
        resolver: zodResolver(FormSchema)
    });

    const [search, setSearch] = useState('');
    const params = new URLSearchParams();
    params.append('search', search);
    const cinemaUri = '/api/be/api/Cinema/cinema-list-normal?' + params.toString();
    const theaterUri = '/api/be/api/TheaterType/theater-type-list?' + params.toString();
    const fetcher = useSwrFetcherWithAccessToken();
    const { data : dataCinema, isLoading : isLoadingCinema, isValidating : isValidatingCinema } = useSwr<GetCinemaNormalResponse[]>(cinemaUri, fetcher);
    const { data : dataType, isLoading : isLoadingType, isValidating : isValidatingType } = useSwr<GetTheaterTypeResponse[]>(theaterUri, fetcher);
    const setSearchDebounced = debounce((t: string) => setSearch(t), 300);

    const optionsCinema = dataCinema?.map(Q => {
        return {
            label: Q.cinemaName,
            value: Q.cinemaId
        };
    }) ?? [];

    const optionsTheaterType = dataType?.map(Q => {
        return {
            label: Q.typeName,
            value: Q.typeId
        };
    }) ?? [];

    


    async function onSubmit(data: FormDataType) {
        try {
            const client = new LatihanExamBackEndClient('http://localhost:3000/api/be');
            await client.registerTheater({
                name: data.name,
                cinemaId: data.cinemaId,
                theaterTypeId: data.typeId
            });
            reset();
            notification.success({
                message: 'Success',
                description: 'Successfully added cinema data',
                placement: 'bottomRight',
            });
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <div>
            <Title>Create New Theater</Title>
            <h2 className='mb-5 text-3xl'>Create New Theater</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <input className='mt-1 px-2 py-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' id='name' {...register('name')}></input>
                    <p className='text-red-500'>{errors['name']?.message}</p>
                </div>
                <div>
                    <label htmlFor='cinema'>Cinema</label>
                    <Controller
                        control={control}
                        name='cinemaId'
                        render={({ field }) => (
                            <Select
                                className='block'
                                showSearch
                                optionFilterProp="children"
                                {...field}
                                onSearch={t => setSearchDebounced(t)}
                                options={optionsCinema}
                                filterOption={false}
                                notFoundContent={(isLoadingCinema || isValidatingCinema) ? <Spin size="small" /> : null}
                            />
                        )}
                    ></Controller>
                </div>

                <div>
                    <label htmlFor='Type'>Type</label>
                    <Controller
                        control={control}
                        name='typeId'
                        render={({ field }) => (
                            <Select
                                className='block'
                                showSearch
                                optionFilterProp="children"
                                {...field}
                                onSearch={t => setSearchDebounced(t)}
                                options={optionsTheaterType}
                                filterOption={false}
                                notFoundContent={(isLoadingType || isValidatingType) ? <Spin size="small" /> : null}
                            />
                        )}
                    ></Controller>
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