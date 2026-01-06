import AboutNumerology from './pages/AboutNumerology';
import Candidates from './pages/Candidates';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Analyzer from './pages/Analyzer';
import JobPostings from './pages/JobPostings';
import Reports from './pages/Reports';
import Marketing from './pages/Marketing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutNumerology": AboutNumerology,
    "Candidates": Candidates,
    "Dashboard": Dashboard,
    "Teams": Teams,
    "Analyzer": Analyzer,
    "JobPostings": JobPostings,
    "Reports": Reports,
    "Marketing": Marketing,
}

export const pagesConfig = {
    mainPage: "AboutNumerology",
    Pages: PAGES,
    Layout: __Layout,
};