// @flow
import isEmail from 'validator/lib/isEmail';
import sg from '@sendgrid/mail';
import fs from 'fs';
const debug = require('debug')('hermes:send-email');
const stringify = require('json-stringify-pretty-compact');
import { events } from 'shared/analytics';
import { trackQueue } from 'shared/bull/queues';
import { userCanReceiveEmail } from './user-can-receive-email';
const { SENDGRID_API_KEY } = process.env;

export type ToType = {
  email: string,
  name?: string,
};

type Options = {
  templateId: string,
  to: Array<ToType>,
  dynamic_template_data: Object,
  userId?: string,
};

const defaultOptions = {
  from: {
    email: 'community@vanila.io',
    name: 'Vanila Community',
  },
  tracking_settings: {
    click_tracking: {
      enable: false,
    },
  },
};

const sendEmail = async (options: Options): Promise<void> => {
  let { templateId, to, dynamic_template_data, userId } = options;

  if (SENDGRID_API_KEY !== 'undefined') {
    debug(
      `--Send LIVE email with templateId ${templateId}--\nto: ${to
        .map(t => t.email)
        .join(', ')}\ndynamic_template_data: ${stringify(
        dynamic_template_data
      )}`
    );
    sg.setApiKey(SENDGRID_API_KEY);
  } else {
    debug(
      `--Send TEST email with templateId ${templateId}--\n--to: ${to
        .map(t => t.email)
        .join(', ')}--`
    );

    // eslint-disable-next-line
    debug(
      stringify({
        templateId,
        to,
        dynamic_template_data,
        userId,
      })
    );

    return Promise.resolve();
  }

  if (userId) {
    trackQueue.add({
      userId: userId,
      event: events.EMAIL_RECEIVED,
    });
  }

  if (await !userCanReceiveEmail({ to, userId })) return Promise.resolve();

  return sg.send({
    ...defaultOptions,
    templateId,
    to,
    dynamic_template_data,
  });
};

export default sendEmail;
