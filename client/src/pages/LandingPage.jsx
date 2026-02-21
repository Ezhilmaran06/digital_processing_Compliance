import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    BarChart3,
    Clock,
    AlertCircle,
    Bell,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    TrendingUp,
    Twitter,
    Linkedin,
    Github,
    Moon,
    Sun,
    ChevronDown,
    Lock,
    Globe,
    Check,
    Play,
    Quote,
    Star,
    MessageSquare,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { scrollYProgress } = useScroll();

    // Scroll progress scale
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax effect for hero
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Features Data
    const features = [
        {
            title: "Change Request Tracking",
            description: "Easily track and manage all change requests from initiation to completion with real-time updates.",
            icon: Clock,
            color: "blue"
        },
        {
            title: "Approval Workflows",
            description: "Automated multi-stage approval processes tailored to your organization's hierarchy and compliance needs.",
            icon: Shield,
            color: "purple"
        },
        {
            title: "Scheduled Deployments",
            description: "Coordinate with teams to schedule deployments during low-risk windows and minimize downtime.",
            icon: Zap,
            color: "green"
        },
        {
            title: "Risk Assessment",
            description: "Built-in risk calculators and impact analysis tools to help teams make informed decisions.",
            icon: AlertCircle,
            color: "yellow"
        },
        {
            title: "Real-Time Notifications",
            description: "Stay updated with instant push and email notifications for every critical action in the workflow.",
            icon: Bell,
            color: "indigo"
        },
        {
            title: "Analytics & Reporting",
            description: "Comprehensive dashboards and exported reports to monitor performance and compliance audits.",
            icon: BarChart3,
            color: "red"
        }
    ];

    // Stats Data
    const stats = [
        { label: "Success Rate", value: 99.8, suffix: "%" },
        { label: "Changes Managed", value: 45, suffix: "K+" },
        { label: "Risk Reduction", value: 60, suffix: "%" },
        { label: "Support Avail", value: 24, suffix: "/7" }
    ];

    // Pricing Data
    const pricing = [
        {
            name: "Starter",
            price: "$49",
            period: "/month",
            description: "Perfect for small teams getting started.",
            features: ["Up to 5 users", "Basic workflows", "Email notifications", "14-day history"],
            cta: "Start Free Trial",
            popular: false
        },
        {
            name: "Pro",
            price: "$149",
            period: "/month",
            description: "For growing teams needing more control.",
            features: ["Up to 20 users", "Advanced workflows", "Slack & Teams integration", "Unlimited history", "Priority email support"],
            cta: "Get Started",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "",
            description: "For large organizations with complex needs.",
            features: ["Unlimited users", "Custom roles & permissions", "SSO & Audit logs", "Dedicated success manager", "24/7 Phone support", "SLA guarantees"],
            cta: "Contact Sales",
            popular: false
        }
    ];

    const steps = [
        {
            num: "01",
            title: "Create Request",
            desc: "Submit detailed change requests with risk assessment and rollback plans."
        },
        {
            num: "02",
            title: "Automated Approval",
            desc: "Smart workflows route requests to the right approvers based on risk and scope."
        },
        {
            num: "03",
            title: "Deploy & Track",
            desc: "Execute changes during scheduled windows and track status in real-time."
        }
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Director of IT Ops",
            company: "TechScale Systems",
            content: "ChangeFlow has completely transformed our compliance posture. The multi-stage approval logic is leagues ahead of traditional ITSM tools. Our audit prep time has dropped by 70%.",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
        },
        {
            name: "Marcus Thorne",
            role: "VP of Engineering",
            company: "Vortex Software",
            content: "The real-time visibility into scheduled changes has eliminated our coordination headaches. It's the rare enterprise tool that engineers actually enjoy using every day.",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
        },
        {
            name: "Elena Rodriguez",
            role: "Security Compliance Officer",
            company: "Global Finovate",
            content: "Built-in risk assessment and immutable audit logs give us the confidence we need for financial industry standards. It's an essential part of our security stack.",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
        }
    ];

    // FAQ Data
    const faqs = [
        {
            question: "How does the approval workflow customization work?",
            answer: "Our visual workflow builder allows you to create complex approval chains based on request type, risk level, or department. You can add parallel approvals, conditional logic, and automated escalations."
        },
        {
            question: "Is ChangeFlow compliant with SOC2 and ISO 27001?",
            answer: "Yes, ChangeFlow is built with security and compliance first. We provides comprehensive audit logs, role-based access control, and data encryption to help you meet regulatory requirements."
        },
        {
            question: "Can I integrate ChangeFlow with my existing tools?",
            answer: "Absolutely. We offer native integrations with Jira, ServiceNow, GitHub, Slack, and MS Teams. Our robust REST API allows for custom integrations with any internal tools."
        },
        {
            question: "What kind of support is included in the Enterprise plan?",
            answer: "Enterprise customers receive 24/7 priority support, a dedicated Customer Success Manager, and personalized onboarding sessions for your entire team."
        }
    ];

    // Helper for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-white dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100`}>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 z-[60] origin-left"
                style={{ scaleX }}
            />

            {/* Improved Dynamic Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                                    <Zap className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all">ChangeFlow</span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {['Platform', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                aria-label="Toggle Theme"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={isDark ? 'dark' : 'light'}
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <Link to="/login" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link>
                            <Link to="/register" className="btn btn-primary text-sm px-6 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300">Get Started</Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-100 dark:border-slate-800 overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-4 flex flex-col gap-4">
                                {['Platform', 'Solutions', 'Pricing'].map((item) => (
                                    <a key={item} href="#" className="text-lg font-medium py-2 text-slate-800 dark:text-slate-200">{item}</a>
                                ))}
                                <hr className="border-slate-100 dark:border-slate-800" />
                                <Link to="/login" className="btn btn-secondary w-full justify-center">Sign In</Link>
                                <Link to="/register" className="btn btn-primary w-full justify-center">Get Started</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-5xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-8 border border-indigo-100/50 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10 group"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            <span className="tracking-widest uppercase">New: Compliance 2.0 Module is here</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
                            Streamline IT Change <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 animate-gradient bg-300%">Management</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                            Manage IT infrastructure changes, track approvals, and automate compliance workflows with confidence.
                        </p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link to="/register" className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all duration-300 ring-4 ring-indigo-500/10">
                                Start Your Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="btn btn-secondary px-8 py-4 text-lg w-full sm:w-auto group hover:-translate-y-1 transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                                Log In to Account
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Infinite Marquee */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-20 overflow-hidden relative"
                    >
                        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10"></div>

                        <div className="flex gap-16 animate-infinite-scroll w-max">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-16 items-center opacity-40 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                    {['TechCorp', 'CloudScale', 'VortiSoft', 'Finovate', 'DevOps Inc.', 'SecureNet', 'DataFlow', 'SysOps'].map((logo, j) => (
                                        <span key={`${i}-${j}`} className="font-black text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default select-none">{logo}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hero Image Mockup with 3D Float */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        whileHover={{ y: -10 }}
                        className="mt-24 relative mx-auto max-w-6xl perspective-2000 cursor-pointer"
                    >
                        <motion.div
                            className="relative rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 overflow-hidden bg-slate-900 dark:bg-slate-900 group"
                            whileHover={{ rotateY: 5, rotateX: 2 }}
                        >
                            {/* Browser Header Bar */}
                            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 h-6 w-96 bg-slate-700/50 rounded-md"></div>
                            </div>

                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2670&q=80" alt="Dashboard Preview" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                        </motion.div>

                        {/* Floating Metric Card 1 */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -bottom-12 -left-8 hidden lg:block p-6 glass-card border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-black/20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl transform hover:scale-105 transition-transform duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl">
                                    <Shield className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Score</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">A+</span>
                                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg font-bold">Passed</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block">Process</span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">How It Works</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Streamlined end-to-end change management in three simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28%] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent z-0"></div>

                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative z-10 text-center"
                            >
                                <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-8 relative group">
                                    <div className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-400/10 rounded-2xl transform rotate-6 transition-transform group-hover:rotate-12 duration-300"></div>
                                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{step.num}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed px-4">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="platform" className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
                {/* ... existing features code ... */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block">Platform</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Comprehensive tools to plan, approve, and execute IT changes across your entire infrastructure.
                        </p>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                className="group relative bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-50 dark:bg-${feature.color}-900/20 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white relative z-10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10 mb-6">
                                    {feature.description}
                                </p>
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                    Learn More <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-950/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Trusted by the best</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all group"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <Quote className="w-10 h-10 text-indigo-500/20 mb-4 group-hover:text-indigo-500/40 transition-colors" />
                                <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 italic leading-relaxed">"{t.content}"</p>
                                <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
                                    <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-indigo-500/10" />
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white">{t.name}</h4>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.role} • {t.company}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-4 block">Pricing</span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Choose the plan that's right for your team.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricing.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-indigo-600 shadow-xl shadow-indigo-600/10 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-transparent'} flex flex-col`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                        <span className="text-slate-500">{plan.period}</span>
                                    </div>
                                    <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/register"
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with Counter */}
            <section className="py-24 border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 backdrop-blur-sm relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="text-center group"
                            >
                                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-2 tabular-nums">
                                    <Counter value={stat.value} />{stat.suffix}
                                </div>
                                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Ready to Transform Your <br />Change Management?</h2>
                        <p className="text-xl md:text-2xl text-indigo-100/90 mb-12 max-w-2xl mx-auto">
                            Join companies of all sizes and start managing your IT infrastructure with confidence today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/register" className="btn bg-white text-indigo-700 hover:bg-slate-50 px-10 py-5 text-xl font-bold w-full sm:w-auto shadow-2xl shadow-indigo-900/40 hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                                Start Free Trial
                            </Link>
                            <Link to="/login" className="btn bg-indigo-500/30 backdrop-blur-md border-2 border-indigo-400/50 text-white hover:bg-indigo-500/50 px-10 py-5 text-xl font-bold w-full sm:w-auto hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                                Login to Account
                            </Link>
                        </div>
                        <p className="mt-10 text-sm text-indigo-200/70 font-medium">No credit card required • 14-day free trial • Cancel anytime</p>
                    </motion.div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse animation-delay-1000"></div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                        <div className="col-span-1 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="text-indigo-500 w-8 h-8" />
                                <span className="text-2xl font-black tracking-tighter text-white">ChangeFlow</span>
                            </div>
                            <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">
                                Centralized change management and compliance for modern engineering teams. Built for scale, security, and speed.
                            </p>

                            {/* Newsletter Signup */}
                            <div className="mb-8">
                                <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-widest text-indigo-400">Subscribe for updates</h5>
                                <div className="flex gap-2 relative">
                                    <input type="email" placeholder="Enter your email" className="bg-slate-900/50 border border-slate-800 text-white px-4 py-3 rounded-xl w-full focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600" />
                                    <button className="absolute right-1 top-1 bottom-1 bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-500 transition-colors text-sm">Join</button>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                {[Twitter, Github, Linkedin, Globe].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 group">
                                        <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns */}
                        {[
                            { title: "Product", links: ["Features", "Security", "API Reference", "Integrations", "Changelog"] },
                            { title: "Company", links: ["About Us", "Customers", "Careers", "Blog", "Contact"] },
                            { title: "Resources", links: ["Documentation", "System Status", "Help Center", "Community", "Legal"] }
                        ].map((col, idx) => (
                            <div key={idx}>
                                <h4 className="text-white font-bold mb-6">{col.title}</h4>
                                <ul className="space-y-4 text-sm">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="hover:text-indigo-400 transition-colors block transform hover:translate-x-1 duration-200">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold tracking-wider text-slate-600">
                        <div>© 2024 ChangeFlow Inc. All rights reserved.</div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Settings</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-components
const Counter = ({ value }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = value / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}</span>;
}

const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-3xl bg-white dark:bg-slate-900 transition-all duration-300 ${isOpen ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 group'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
            >
                <span className={`font-black text-xl pr-8 transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{question}</span>
                <span className={`p-3 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-indigo-100 dark:bg-indigo-900/30 rotate-180 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <ChevronDown className="w-6 h-6" />
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-8 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/50 mt-2 text-lg">
                            {answer}
                            <div className="mt-6 flex items-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest cursor-pointer hover:underline">
                                Still have questions? Contact Support <ExternalLink size={14} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LandingPage;
