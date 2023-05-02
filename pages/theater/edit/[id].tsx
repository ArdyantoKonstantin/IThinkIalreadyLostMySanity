import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { z } from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { GetCinemaNormalResponse, GetTheaterDetailResponse, GetTheaterTypeResponse, LatihanExamBackEndClient } from '@/functions/swagger/LatihanExamBackEnd';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { notification } from 'antd';
import { useState } from 'react';
import useSwr from 'swr';
import { Select, Spin } from 'antd';
import debounce from 'lodash.debounce';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { useRouter } from 'next/router';

const FormSchema = z.object({
    cinemaId: z.string().nonempty({
        message: 'Cinema tidak boleh kosong'
    }),
    typeId: z.string().nonempty({
        message: 'Type tidak boleh kosong'
    })
});

type FormDataType = z.infer<typeof FormSchema>;

const EditForm: React.FC<{
    id: number,
    theater: GetTheaterDetailResponse,
    onEdited: () => void,
}> = ({ id, theater , onEdited}) => {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<FormDataType>({
        defaultValues: {
            cinemaId: theater.cinemaId,
            typeId: theater.typeId
        },
        resolver: zodResolver(FormSchema)
    });

    async function onSubmit(data: FormDataType) {
        try {
            const client = new LatihanExamBackEndClient('http://localhost:3000/api/be');
            await client.updateTheater(id, data.cinemaId, data.typeId);
            reset(data);
            onEdited();
            notification.success({
                message: 'Success',
                description: 'Successfully updated theater data',
                placement: 'bottomRight',
            });
        } catch (error) {
            console.error(error);
        }
    }

    const [search, setSearch] = useState('');
    const params = new URLSearchParams();
    params.append('search', search);
    const cinemaUri = '/api/be/api/Cinema/cinema-list-normal?' + params.toString();
    const theaterUri = '/api/be/api/TheaterType/theater-type-list?' + params.toString();
    const fetcher = useSwrFetcherWithAccessToken();
    const { data: dataCinema, isLoading: isLoadingCinema, isValidating: isValidatingCinema } = useSwr<GetCinemaNormalResponse[]>(cinemaUri, fetcher);
    const { data: dataType, isLoading: isLoadingType, isValidating: isValidatingType } = useSwr<GetTheaterTypeResponse[]>(theaterUri, fetcher);
    
    const setSearchDebounced = debounce((t: string) => setSearch(t), 300);

    const optionsCinema = dataCinema?.map(Q => {
        return {
            label: Q.cinemaName,
            value: Q.cinemaId
        };
    }) ?? [{
        label: theater.cinemaName,
        value: theater.cinemaId
    }];

    const optionsTheaterType = dataType?.map(Q => {
        return {
            label: Q.typeName,
            value: Q.typeId
        };
    }) ?? [{
        label: theater.typeName,
        value: theater.typeId
    }];
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                 <p className='text-red-500'>{errors['cinemaId']?.message}</p>
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
                 <p className='text-red-500'>{errors['typeId']?.message}</p>
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
    const theaterDetailsUri = id ? `/api/be/api/Theater/theater-detail?id=${id}` : undefined;
    const fetcher = useSwrFetcherWithAccessToken();
    const { data, mutate } = useSwr<GetTheaterDetailResponse>(theaterDetailsUri, fetcher);

    function renderForm() {
        if (!id || !data || typeof id !== 'string') {
            return;
        }

        return (
            <EditForm id={Number(id)} theater={data} onEdited={() => mutate()}></EditForm>
        );
    }
    return (
        <div>
            <Title>Update Theater</Title>
            <h2 className='mb-5 text-3xl'>Update Theater</h2>
            {renderForm()}
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;