import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import '../../css/app.css'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const user = props.user;

    const steps = [
        {
            number: 1,
            title: "Inspection",
            desc: "Lakukan inspeksi pada model yang telah diupload. Jika ada masalah, catat risiko.",
            link: "/models"
        },
        {
            number: 2,
            title: "Catat Perubahan",
            desc: "Jika ingin mengatasi resiko atau ada perubahan pada model, catatkan di page model viewer."
        },
        {
            number: 3,
            title: "Analisis Dampak",
            desc: "Analisis dampak perubahan, termasuk waktu, biaya, serta potensi risiko tambahan."
        },
        {
            number: 4,
            title: "Persetujuan",
            desc: "Ajukan hasil analisis untuk disetujui oleh pihak manajemen atau penanggung jawab proyek.",
            link: user.role === 'admin' ? '/admin/changes' : null
        },
        {
            number: 5,
            title: "Implementasi",
            desc: "Setelah disetujui, lakukan perubahan sesuai rencana dan dokumentasikan prosesnya.",
            link: "/bimUpload"
        },
        {
            number: 6,
            title: "Evaluasi",
            desc: "Lakukan evaluasi terhadap hasil implementasi untuk memastikan efektivitas perubahan.",
            link: user.role === 'admin' ? '/admin/changes' : null
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex h-full w-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-0"
            >

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="hero"
                >
                    <div className="hero-content text-center flex justify-center flex-col items-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-6xl font-bold mb-4"
                        >
                            Information System For Controlling Change Order
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            This website optimizes your working schedule by tracking model changes and progress.
                        </motion.p>
                    </div>
                </motion.div>

                {/* Get Started Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full flex flex-col max-w-[80%] justify-center items-center p-[50px]"
                >
                    <p className="text-4xl font-bold m-4">Get Started!</p>
                    <p className="text-sm text-center">
                        Upload model BIM pada BIM upload dan jika sudah upload, silakan lanjutkan ke BIM View.
                    </p>

                    <div className="flex">
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Link href={'bimUpload'}>
                                <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-600 m-4 rounded-md transition">
                                    Upload Bim
                                </button>
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Link href={'models'}>
                                <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-600 m-4 rounded-md transition">
                                    View Bim
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Steps Section */}
                    <div className="w-full flex flex-col items-center mt-[50px]">
                        <h1 className="w-fit text-4xl text-center mb-4 font-bold">Cara untuk mencatat perubahan</h1>

                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 * index, duration: 0.5 }}
                                className="flex items-center border-bottom border-b py-[20px] w-full"
                            >
                                <div
                                    style={{ justifyContent: 'center' }}
                                    className="rounded-[50%] mr-[20px] min-w-[35px] h-[35px] flex items-center content-center bg-black text-white dark:bg-white dark:text-black"
                                >
                                    {step.number}
                                </div>

                                <p className="font-bold mr-[20px]">{step.title}</p>
                                <span>{step.desc}</span>

                                {step.link && (
                                    <Link href={step.link}>
                                        <button className="bg-white rounded-[2px] ms-2 px-2 py-1 text-black hover:bg-slate-400 transition">
                                            Click here
                                        </button>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
