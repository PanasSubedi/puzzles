const COLORS = {
  "empty": "#fff",
  "red": "#ea1212",
  "dark-pink": "#ed6fa9",
  "pink": "#efa5c5",
  "blue": "#148bd2",
  "yellow": "#fbe83c",
  "purple": "#b461ae",
  "dark-purple": "#713e8f",
  "green": "#81ce85",
  "dark-orange": "#f27021",
  "dark-green": "#08a037",
  "orange": "#f3ba32",
  "light-blue": "#89c9ef",
  "selected-valid": "#119a53",
  "selected-invalid": "#ea1212",
}

export const Ball = ({ position, color, transparent, opacity }) => (
  <mesh position={[...position]}>
    <sphereGeometry attach="geometry" />
    <meshStandardMaterial
      attach="material"
      color={COLORS[color]}
      transparent={transparent}
      opacity={transparent ? opacity : 1}
    />
  </mesh>
)
