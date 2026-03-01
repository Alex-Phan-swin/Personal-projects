"use client";
import dynamic from "next/dynamic";
import {customdata} from "plotly.js/src/plots/attributes";



const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function DBScanGraph({ data }) {
    const colours_array = ["red", "green", "blue", "yellow", "orange", "pink", "purple", "brown"];
    const traces = [
        ...data.clusters.map((cluster, i) => ({
            x: cluster.points.map(p => p.x),
            y: cluster.points.map(p => p.y),
            customdata: cluster.points.map(p => p.spamChance * 100),
            type: "scatter",
            mode: "markers",
            name: "Cluster " + (i+1),
            marker: {
                color: colours_array[cluster.cluster_id % colours_array.length],
                size: 10,
                opacity: cluster.points.map(p => p.spamChance / 1.25 + 0.15),
            },
            text: Array(cluster.points.length).fill("Cluster " + (i + 1)),
            hovertemplate: "Cluster: %{text}<br>Spamchance: %{customdata: .0f}%<extra></extra>",
        }))
    ];


    return (
            <Plot
                data={traces}
                layout={{
                    autosize: true,
                    useResponsive: true,
                    title: "DBSCAN Clusters",
                    xaxis: { title: "Feature X" },
                    yaxis: { title: "Feature Y" },
                }}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
            />
    );
}