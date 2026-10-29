import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge3D } from './Badge3D';

describe('Badge3D pointer tilt', () => {
  it('does not re-render the React tree on pointer move', () => {
    let renders = 0;
    function Probe() {
      renders += 1;
      return <Badge3D asset="/img/item_detector_mirror_golden.png" label="Детектор" />;
    }

    const { getByTestId } = render(<Probe />);
    const afterMount = renders;
    fireEvent.pointerMove(getByTestId('badge-3d'), { clientX: 80, clientY: 40 });
    fireEvent.pointerLeave(getByTestId('badge-3d'));
    expect(renders).toBe(afterMount);
  });

  it('keeps a static plate when tilt is disabled', () => {
    const { getByTestId } = render(
      <Badge3D asset="/img/item_detector_mirror_golden.png" label="Детектор" disableTilt />
    );
    expect(getByTestId('badge-3d').parentElement).toHaveAttribute('data-tilt-disabled', 'true');
  });
});
