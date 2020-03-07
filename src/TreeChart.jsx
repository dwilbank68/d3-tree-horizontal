import React, { useRef, useEffect } from "react";
import { select, hierarchy, tree, linkHorizontal, linkVertical } from "d3";
// scaleBand for ordinal data like 1,2,3,4,5, scaleLinear for continuous data like 6.37, 1.333, etc
import useResizeObserver from "./useResizeObserver.js";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => { ref.current = value; });
    return ref.current;
}

function TreeChart({ data }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    // wrapperRef is a div surrounding the svg because svg won't give
    // true dimensions in useResizeObserver
    const dimensions = useResizeObserver(wrapperRef);

    const previouslyRenderedData = usePrevious(data);



    useEffect(() => {
        // called as soon as DOM is rendered, then every time data or dimensions change
        const svg = select(svgRef.current);
        if (!dimensions) return;
        const {width, height} = dimensions || wrapperRef.current.getBoundingClientRect();
        const root = hierarchy(data);
        const treeLayout = tree().size([height, width]); // [width, height] for top-down tree
        const linkGenerator = linkHorizontal()  // linkVertical for top-down tree
            // .source(link = link.source)     // default
            // .target(link => link.target)    // default
            .x(node => node.y)                  // node.x for top-down tree
            .y(node => node.x)                  // node.y for top-down tree

        treeLayout(root);

        svg
            .selectAll(".node")
            .data(root.descendants())
            .join(enter => enter.append("circle").attr("opacity", 0))
            .attr("class", "node")
            // .attr("cx", node => node.x) // top-down tree
            // .attr("cy", node => node.y) // top-down tree
            .attr("cx", node => node.y)
            .attr("cy", node => node.x)
            .attr("r", 4)
            .attr('fill', 'black')
  
            .transition()
            .duration(500)
            .delay(node => node.depth * 300)
            .attr('opacity', 1);

        const enteringAndUpdatingLinks = svg
            .selectAll(".link")
            .data(root.links())
            .join("path")
            .attr("class", "link")
            // .attr("d", linkObj => linkGenerator(linkObj))
            .attr("d", linkGenerator)      // same as above (JavaScript rule)
            .attr('stroke-dasharray', function() {
                const length = this.getTotalLength();
                return `${length} ${length}`
            })
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr("opacity", 1);

            // .attr("cx", node => node.x) // top-down tree
            // .attr("cy", node => node.y) // top-down tree
            // .attr("cx", node => node.y)
            // .attr("cy", node => node.x)

        if (data !== previouslyRenderedData) {
            enteringAndUpdatingLinks
                .attr("stroke-dashoffset", function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(500)
                .delay(link => link.source.depth * 500)
                .attr("stroke-dashoffset", 0);
        }

        svg
            .selectAll(".label")
            .data(root.descendants())
            .join(enter => enter.append("text").attr("opacity", 0))
            .attr("class", "label")
            .attr("x", node => node.y)
            .attr("y", node => node.x - 12)
            .attr("text-anchor", "middle")
            .attr("font-size", 24)
            .text(node => node.data.name)
            .transition()
            .duration(500)
            .delay(node => node.depth * 300)
            .attr("opacity", 1);

    }, [data, dimensions, previouslyRenderedData]);

    return (
        <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
            <svg ref={svgRef}>
            </svg>
        </div>
    );
}

export default TreeChart;