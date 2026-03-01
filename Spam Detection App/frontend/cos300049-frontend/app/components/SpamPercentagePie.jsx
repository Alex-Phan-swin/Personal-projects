"use client";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function SpamPercentagePie({ spamChance }) {
    const colours_array = ["red", "green"];

    const pieData = {
        labels: ["Spam", "Not Spam"],
        values: [spamChance, 1.0 - spamChance],
        marker: {colors: colours_array},
        type: "pie",
        name: "Spam Chance Visualisation"
    }


    return (
            <Plot
                data={[pieData]}
                layout={{
                    autosize: true,
                    useResponsive: true,
                    title: "Spam Chance",
                    showlegend: true
                }}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
            />

    );
}