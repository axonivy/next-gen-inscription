import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tags from './Tags';
import { DEFAULT_EDITOR_CONTEXT, EditorContextInstance } from '../../../context';

describe('Tags', () => {
  function renderTags(): {
    data: () => string[];
    rerender: () => void;
  } {
    let tags: string[] = [];
    userEvent.setup();
    const view = render(<Tags tags={['test', 'bla']} onChange={newTags => (tags = newTags)} />);
    return {
      data: () => tags,
      rerender: () => view.rerender(<Tags tags={tags} onChange={newTags => (tags = newTags)} />)
    };
  }

  function assertTags(expectedTags: string[]): Promise<void> {
    return waitFor(() => {
      const tags = screen.getAllByRole('gridcell');
      expect(tags).toHaveLength(expectedTags.length);
      expectedTags.forEach((expectedTag, index) => {
        expect(tags[index]).toHaveTextContent(expectedTag);
      });
    });
  }

  test('tags will render', async () => {
    renderTags();
    await assertTags(['test', 'bla']);
  });

  test('tags can be removed', async () => {
    const view = renderTags();

    const testTag = screen.getByRole('button', { name: /test/i });
    await userEvent.click(testTag);

    view.rerender();
    await assertTags(['bla']);
    expect(view.data()).toHaveLength(1);
  });

  test('tags can be added', async () => {
    const view = renderTags();

    const addTagBtn = screen.getByRole('button', { name: /Add new tag/i });
    await userEvent.click(addTagBtn);
    const popupInput = screen.getByLabelText('New Tag');
    await userEvent.type(popupInput, 'new tag');
    const popupCloseBtn = screen.getByRole('button', { name: /Close/i });
    await userEvent.click(popupCloseBtn);

    view.rerender();
    await assertTags(['test', 'bla', 'new tag']);
    expect(view.data()).toHaveLength(3);
    expect(view.data()[2]).toEqual('new tag');
  });

  test('tags can be handled with keyboard', async () => {
    const view = renderTags();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: /test/i })).toHaveFocus();
    await userEvent.keyboard('[Enter]');

    view.rerender();
    await assertTags(['bla']);
    expect(view.data()).toHaveLength(1);

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /Add new tag/i })).toHaveFocus();
    await userEvent.keyboard('[Enter]');

    expect(screen.getByLabelText('New Tag')).toHaveFocus();
    await userEvent.keyboard('new tag');
    await userEvent.keyboard('[Enter]');

    expect(screen.getByRole('button', { name: /Add new tag/i })).toHaveFocus();
    view.rerender();
    await assertTags(['bla', 'new tag']);
    expect(view.data()).toHaveLength(2);
  });

  test('tags support readonly mode', async () => {
    render(
      <EditorContextInstance.Provider value={{ ...DEFAULT_EDITOR_CONTEXT, readonly: true }}>
        <Tags tags={['test']} onChange={() => {}} />
      </EditorContextInstance.Provider>
    );

    expect(screen.getByRole('button', { name: /test/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Add new tag/i })).toBeDisabled();
  });
});
