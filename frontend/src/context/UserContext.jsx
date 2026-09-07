import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState({
    role: "Data Scientist",

    answers: {
      sqlExperience: "",
      mlExperience: "",
      pythonExperience: "",
    },

    skills: [
      {
        name: "SQL & Data Modeling",
        impact: "AI-Augmented",
        impactType: "augment",
        depth: "AI-AUGMENT",
        current: 70,
        target: 80,
      },
      {
        name: "Experiment Design",
        impact: "Human-Core",
        impactType: "human",
        depth: "MASTER",
        current: 35,
        target: 85,
      },
      {
        name: "Statistical Reasoning",
        impact: "Human-Core",
        impactType: "human",
        depth: "MASTER",
        current: 55,
        target: 85,
      },
      {
        name: "Python",
        impact: "AI-Augmented",
        impactType: "augment",
        depth: "AI-AUGMENT",
        current: 60,
        target: 75,
      },
      {
        name: "Data Visualization",
        impact: "AI-Augmented",
        impactType: "augment",
        depth: "AI-AUGMENT",
        current: 50,
        target: 70,
      },
      {
        name: "Prompt Engineering",
        impact: "AI-Augmented",
        impactType: "augment",
        depth: "AI-AUGMENT",
        current: 20,
        target: 70,
      },
      {
        name: "ML Ops",
        impact: "AI-Accelerated",
        impactType: "accelerated",
        depth: "BASIC-AWARENESS",
        current: 15,
        target: 40,
      },
      {
        name: "Dashboard Reporting",
        impact: "AI-Accelerated",
        impactType: "accelerated",
        depth: "BASIC-AWARENESS",
        current: 45,
        target: 40,
      },
    ],
  });

  const updateAnswer = (key, value) => {
    setUserProfile((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [key]: value,
      },
    }));
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateAnswer,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}