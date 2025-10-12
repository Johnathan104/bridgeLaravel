import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import '../../css/app.css'


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const user = props.user
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full w-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-0">
                <div className="hero">
                    <div className="hero-content text-center flex justify-center flex-col items-center">
                        <h1 className='text-6xl font-bold mb-4'>Welcome to the Bridge Construction Project!</h1>
                        <p>This website aims to optimize your working schedulte by creating a way to track changes and progress along the parts, please enjoy your usage!</p>
                    </div>
                </div>
                <div className="w-full flex flex-col max-w-[80%] justify-center items-center p-[50px]">
                    <p className="text-4xl font-bold m-4">Get Started!</p>
                    <p className="text-sm text-center">Upload model BIM pada BIM upload dan jika sudah upload, silakan lanjutkan ke BIM view untuk melihat
                        semua yang telah diupload dan dari situ dapat mencatat risiko-risiko dan perubahan yang terjadi pada model tersebut
                    </p>
                    <div className="flex">
                        <Link href={'bimUpload'}>
                            <button className="px-4 py-2 bg-neutral-800  hover:bg-neutral-600 m-4">Upload Bim</button>
                        </Link>
                        <Link href={'models'}>
                            <button className="px-4 py-2 bg-neutral-800  hover:bg-neutral-600 m-4">View Bim</button>
                        </Link>
                    </div>
                    <div className="w-full flex flex-col items-center mt-[50px]">
                        <h1 className='w-fit text-4xl text-center mb-4 font-bold'>Cara untuk mencatat perubahan</h1>
                        <div className="flex items-center border-bottom border-b py-[20px] w-full">
                            <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                                 1
                            </div>
                            <p className='font-bold mr-[20px]'>Inspection </p> lakukan inspeksi pada model yang telah diupload, lihat model-model yang telah di upload di BIM view, jika ada masalah catat resiko 
                            
                            <Link href='/models'>
                            <button className='bg-white rounded-[2px] px-2 py-1 text-black hover:bg-slate-400'> Click here </button>
                        </Link>
                        </div>
                        <div className="flex items-center border-bottom border-b py-[20px] w-full">
                            <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                                 2
                            </div>
                            <p className='font-bold mr-[20px]'>Catat Perubahan </p> jika ingin mengatasi resiko atau ada perubahan pada model catatkan di page model viewer
                            
                        </div>
                        <div className="flex items-center border-bottom border-b py-[20px] w-full">
                    <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[45px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                        3
                    </div>
                    <p className='font-bold mr-[20px]'>Analisis Dampak </p> lakukan analisis terhadap dampak dari perubahan, termasuk waktu, biaya, serta potensi risiko tambahan, Ini dilakukan di form yang sama untuk mencatat perubahan
                    
                </div>

                <div className="flex items-center border-bottom border-b py-[20px] w-full">
                    <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                        4
                    </div>
                    <p className='font-bold mr-[20px]'>Persetujuan </p> ajukan hasil analisis untuk disetujui oleh pihak manajemen atau penanggung jawab proyek
                    {user.role== 'admin'?
                        <Link href='/admin/changes'>
                            <button className='bg-white ml-2 rounded-[2px] px-2 py-1 text-black hover:bg-slate-400'> Click heres </button>
                        </Link>
                        :
                        ''
                    }
                </div>

                <div className="flex items-center border-bottom border-b py-[20px] w-full">
                    <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                        5
                    </div>
                    <p className='font-bold mr-[20px]'>Implementasi </p> setelah disetujui, lakukan perubahan sesuai dengan rencana dan pastikan semua catatan pelaksanaan terdokumentasi
                    <Link href='/bimUpload'>
                    <button className='bg-white px-2 py-1 rounded-[2px] text-black hover:bg-slate-400'> Click here </button>
                </Link>
                </div>

                <div className="flex items-center border-bottom border-b py-[20px] w-full">
                    <div style={{justifyContent:'center'}} className="rounded-[50%] mr-[20px] w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black ">
                        6
                    </div>
                    <p className='font-bold mr-[20px]'>Evaluasi </p> lakukan evaluasi terhadap hasil implementasi untuk memastikan efektivitas perubahan dan kesesuaian dengan tujuan awal
                </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
