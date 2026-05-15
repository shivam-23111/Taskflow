import { Outlet } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi2';
import heroImage from '../assets/hero.png';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950 px-4 py-6 text-dark-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-dark-800 bg-dark-900 shadow-2xl shadow-black/30 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden border-r border-dark-800 bg-dark-950 lg:block">
          <div className="flex h-full flex-col justify-between p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-500/15">
                <HiOutlineSparkles className="text-xl text-primary-200" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight text-dark-50">TaskFlow</p>
                <p className="text-xs font-semibold uppercase text-primary-300">Delivery OS</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase text-amber-300">
                  Plan. Assign. Ship.
                </p>
                <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-dark-50">
                  Keep project work visible without losing the human rhythm.
                </h1>
              </div>
              <div className="overflow-hidden rounded-lg border border-dark-800 bg-dark-900">
                <img
                  src={heroImage}
                  alt="TaskFlow workspace preview"
                  className="h-72 w-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-dark-800 bg-dark-900 p-3">
                <p className="font-semibold text-dark-50">Projects</p>
                <p className="mt-1 text-xs text-dark-500">Deadline led</p>
              </div>
              <div className="rounded-md border border-dark-800 bg-dark-900 p-3">
                <p className="font-semibold text-dark-50">Tasks</p>
                <p className="mt-1 text-xs text-dark-500">Priority aware</p>
              </div>
              <div className="rounded-md border border-dark-800 bg-dark-900 p-3">
                <p className="font-semibold text-dark-50">Teams</p>
                <p className="mt-1 text-xs text-dark-500">Role based</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-500/15">
                <HiOutlineSparkles className="text-xl text-primary-200" />
              </div>
              <h1 className="text-2xl font-bold text-dark-50">TaskFlow</h1>
            </div>

            <div className="rounded-lg border border-dark-800 bg-dark-950 p-6 shadow-xl shadow-black/20 sm:p-8">
              <Outlet />
            </div>

            <p className="mt-6 text-center text-sm text-dark-600">
              TaskFlow keeps project ownership, status, and deadlines in one place.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
