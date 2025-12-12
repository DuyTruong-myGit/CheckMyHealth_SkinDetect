import { useState } from 'react'
import './Tabs.css'

const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
    const [activeTab, setActiveTab] = useState(defaultTab)

    const handleTabClick = (index) => {
        setActiveTab(index)
        if (onChange) {
            onChange(index)
        }
    }

    return (
        <div className="tabs">
            <div className="tabs__header" role="tablist">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tabs__tab ${activeTab === index ? 'tabs__tab--active' : ''}`}
                        onClick={() => handleTabClick(index)}
                        role="tab"
                        aria-selected={activeTab === index}
                        aria-controls={`tabpanel-${index}`}
                        id={`tab-${index}`}
                    >
                        {tab.icon && <span className="tabs__icon">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tabs__content">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tabs__panel ${activeTab === index ? 'tabs__panel--active' : ''}`}
                        role="tabpanel"
                        id={`tabpanel-${index}`}
                        aria-labelledby={`tab-${index}`}
                        hidden={activeTab !== index}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Tabs
