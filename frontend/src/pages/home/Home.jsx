import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import PlusButton from '../../components/plusButton/PlusButton';
import CreateDonation from '../../components/createDonation/CreateDonation';
import SearchButton from '../../components/searchButton/SearchButton';
import BlogFeed from '../../components/blogFeed/BlogFeed';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const STATS = [
    { value: '10,000+', label: 'Meals Donated' },
    { value: '500+',    label: 'Active Donors' },
    { value: '200+',    label: 'NGO Partners' },
    { value: '50+',     label: 'Cities Covered' },
];

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <Layout>
            {/* Hero */}
            <section className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left: text */}
                        <div className="mb-12 lg:mb-0">
                            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold tracking-wide uppercase">
                                Fighting Hunger Together
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                                Turn Surplus Food Into{' '}
                                <span className="text-brand-600">Someone's Meal</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                                HungerConnect bridges food providers — restaurants, hotels, individuals — with NGOs and shelters to ensure every meal finds someone who needs it.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/register" className="btn-primary text-base px-6 py-3">
                                            Get Started
                                        </Link>
                                        <Link to="/allblogs" className="btn-secondary text-base px-6 py-3">
                                            Read Stories
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {user?.role === 'PROVIDER' && (
                                            <button onClick={() => setOpen(true)} className="btn-primary text-base px-6 py-3">
                                                Donate Food
                                            </button>
                                        )}
                                        <Link to="/allblogs" className="btn-secondary text-base px-6 py-3">
                                            Read Stories
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: image collage */}
                        <div className="relative hidden lg:block">
                            <div className="grid grid-cols-2 gap-4">
                                <img
                                    src="https://i.imgur.com/3Gv1fGW.jpg"
                                    alt="Food donation"
                                    className="rounded-2xl object-cover w-full h-52 shadow-lg"
                                />
                                <img
                                    src="https://i.imgur.com/3OHS2xi.png"
                                    alt="Community"
                                    className="rounded-2xl object-cover w-full h-52 shadow-lg mt-8"
                                />
                                <img
                                    src="https://i.imgur.com/to09FoS.jpg"
                                    alt="Volunteers"
                                    className="rounded-2xl object-cover w-full h-52 shadow-lg -mt-4"
                                />
                                <img
                                    src="https://i.imgur.com/mjj34Ue.jpg"
                                    alt="Meals"
                                    className="rounded-2xl object-cover w-full h-52 shadow-lg mt-4"
                                />
                            </div>
                            {/* Decorative badge */}
                            <div className="absolute -bottom-4 -left-4 bg-brand-600 text-white rounded-2xl p-4 shadow-xl">
                                <p className="text-3xl font-bold">0</p>
                                <p className="text-sm font-medium opacity-90">Food Wasted</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-100">
                        {STATS.map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-3xl font-bold text-slate-900">{value}</p>
                                <p className="text-sm text-slate-500 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
                    <p className="text-slate-500 text-base">Three simple steps to make an impact</p>
                </div>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: 'Register', desc: 'Sign up as a Food Provider or Food Distributor in minutes.' },
                        { step: '02', title: 'Connect', desc: 'Providers post available food. Distributors browse and accept donations.' },
                        { step: '03', title: 'Impact', desc: 'Food reaches families in need. Stories are shared with the community.' },
                    ].map(({ step, title, desc }) => (
                        <div key={step} className="card p-6 text-center hover:shadow-md transition-shadow">
                            <span className="inline-block text-4xl font-bold text-brand-200 mb-3">{step}</span>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Blog feed */}
            <BlogFeed />

            {/* Floating action buttons for authenticated roles */}
            {isAuthenticated && user?.role === 'PROVIDER' && (
                <div className="fixed bottom-8 right-8 z-50">
                    <PlusButton onClick={() => setOpen(true)} />
                    <CreateDonation open={open} setOpen={setOpen} />
                </div>
            )}
            {isAuthenticated && user?.role === 'DISTRIBUTOR' && (
                <div className="fixed bottom-8 right-8 z-50">
                    <SearchButton />
                </div>
            )}
        </Layout>
    );
}
