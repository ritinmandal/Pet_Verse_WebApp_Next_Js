
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User as UserIcon, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('Guest');
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  
  const fetchCartCount = useCallback(async (uid: string) => {
    const { data } = await supabase.from('cart').select('quantity').eq('user_id', uid);
    if (data) setCartCount(data.reduce((sum, r: any) => sum + Number(r.quantity || 0), 0));
  }, []);

  
  useEffect(() => {
    let cleanup: (() => void)[] = [];

    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('users').select('first_name').eq('id', user.id).single();
        setFirstName(profile?.first_name || 'Doctor');
        fetchCartCount(user.id);

        const channel = supabase
          .channel(`cart-${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'cart', filter: `user_id=eq.${user.id}` },
            () => fetchCartCount(user.id)
          )
          .subscribe();

        const interval = setInterval(() => fetchCartCount(user.id), 5000);
        const onVis = () => document.visibilityState === 'visible' && fetchCartCount(user.id);
        document.addEventListener('visibilitychange', onVis);

        cleanup.push(
          () => supabase.removeChannel(channel),
          () => clearInterval(interval),
          () => document.removeEventListener('visibilitychange', onVis)
        );
      } else {
        setUserId(null);
        setFirstName('Guest');
        setCartCount(0);
      }
      setIsLoading(false);
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        cleanup.forEach(fn => fn());
        cleanup = [];
        initUser();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setFirstName('Guest');
        setCartCount(0);
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        cleanup.forEach(fn => fn());
        cleanup = [];
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanup.forEach(fn => fn());
    };
  }, [fetchCartCount]);

  
  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setUserId(null);
    setFirstName('Guest');
    setCartCount(0);
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDashboardClick = () => {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/dashboard');
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Discover', href: '/map' },
    { name: 'Products', href: '/products' },
    { name: 'Health', href: '/vet' },
    { name: 'Contact', href: '/contactUs' },
  ];

  
  const UserDropdown = ({ isMobile = false }) => {
    const isOpen = isMobile ? mobileDropdownOpen : dropdownOpen;
    const setOpen = isMobile ? setMobileDropdownOpen : setDropdownOpen;

    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors"
        >
          <UserIcon className="h-5 w-5 opacity-80" />
          <span className="font-inter text-sm md:text-base">
            Hi, <span className="font-semibold">{firstName}</span>
          </span>
          <ChevronDown size={16} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${
                isMobile
                  ? 'left-0 bg-gradient-to-br from-teal-800/80 via-blue-900/80 to-cyan-900/70'
                  : 'right-0 bg-gradient-to-br from-blue-900/80 via-cyan-800/70 to-teal-900/70'
              } mt-2 w-40 rounded-lg shadow-xl text-white py-2 backdrop-blur-xl border border-white/10`}
            >
              <button onClick={handleDashboardClick} className="w-full text-left px-4 py-2 hover:bg-white/10">My Profile</button>
              <button onClick={handleSignOut} className="w-full text-left px-4 py-2 hover:bg-white/10">Sign Out</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CartIcon = ({ onClick }: { onClick?: () => void }) => (
    <Link href="/cart" onClick={onClick} className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-white/10 transition">
      <ShoppingCart className="h-6 w-6 text-white" />
      {cartCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-black grid place-items-center shadow animate-pulse"
        >
          {cartCount}
        </motion.span>
      )}
    </Link>
  );

  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-gradient-to-br from-blue-700/60 via-cyan-700/60 to-blue-500/50 backdrop-blur-xl shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 md:h-20 relative">
          
          <Link href="/" className="flex items-center space-x-2 group z-50">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image 
                src="/images/logo2.png" 
                alt="PetVerse Logo" 
                width={60} 
                height={60} 
                className="object-contain"
                priority
              />
            </motion.div>
            <motion.span className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors tracking-widest">
              PetVerse
            </motion.span>
          </Link>

          
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center">
            <div className="flex items-center space-x-10">
              {navItems.map((item, index) => (
                <motion.div key={item.name} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Link href={item.href} className="text-white hover:text-amber-300 font-medium relative group tracking-wide">
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-300 transition-all duration-200 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          
          <div className="hidden md:flex items-center gap-4 z-50">
            {!isLoading && userId ? (
              <>
                <CartIcon />
                <UserDropdown />
              </>
            ) : !isLoading && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-amber-400 hover:to-yellow-500 text-white font-semibold px-6 py-2 rounded-full shadow-md tracking-wide">
                    Join PetVerse
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 relative w-8 h-8 flex flex-col justify-center items-center group z-50"
            whileTap={{ scale: 0.9 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="absolute h-0.5 w-6 bg-white rounded"
                initial={false}
                animate={{
                  rotate: isMobileMenuOpen && i !== 1 ? (i === 0 ? 45 : -45) : 0,
                  y: isMobileMenuOpen ? 0 : (i === 0 ? -6 : i === 2 ? 6 : 0),
                  opacity: isMobileMenuOpen && i === 1 ? 0 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.button>
        </div>

        
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gradient-to-br from-blue-900/80 via-teal-800/70 to-cyan-900/70 backdrop-blur-xl rounded-xl mt-2 shadow-lg border border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {!isLoading && userId && (
                  <div className="flex flex-col gap-2">
                    <CartIcon onClick={() => setIsMobileMenuOpen(false)} />
                    <UserDropdown isMobile />
                  </div>
                )}

                {navItems.map((item, index) => (
                  <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-white hover:text-amber-300 font-medium py-2 tracking-wide">
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {!isLoading && !userId && (
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-amber-400 hover:to-yellow-500 text-white font-semibold py-2 rounded-full mt-4 shadow-md">
                      Join PetVerse
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
